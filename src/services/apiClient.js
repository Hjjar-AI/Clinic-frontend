// frontend/src/services/apiClient.js
import axios from 'axios'
import { onSessionChange, sessionGeneration } from '@/services/sessionState'

import { API_EVENTS, emit } from '@/services/apiEvents'
import { useLoadingStore } from '@/stores/loading'
import { handleApiError } from '@/utils/apiErrorHandler'
import { MSG_NETWORK_ERROR } from '@/utils/errorMessages'
import { generateIdempotencyKey } from '@/utils/idempotency'

const pendingRequests = new Map()
const persistentRequests = new Set()
const uncertainOperations = new Map()
// The caller owns the opening version; later reads must never replace it.
function requiresOpeningVersion(config) {
  const path = (config.url || '').split('?')[0]
  if (['put', 'patch', 'delete'].includes(config.method)) {
    return /^\/(?:patients|visits|appointments|billing|tasks|templates|scales|options\/(?:diagnoses|medications)|auth\/users)\/\d+(?:\/|$)/.test(path) ||
      /^\/auth\/users\/permissions\/\d+\//.test(path) || /^\/settings\/(?:theme\/)?$/.test(path)
  }
  return config.method === 'post' && (
    /^\/patients\/\d+\/(?:records|archive|restore|anonymize|care_team_add|duplicate_review|merge)\/$/.test(path) ||
    /^\/(?:visits\/\d+\/attachments|(?:templates|scales|options\/(?:diagnoses|medications))\/\d+\/(?:reactivate|add-field))\/$/.test(path) || /^\/referrals\/visit\/\d+\/$/.test(path))
}

function getRequestKey(config) {
  let body = ''
  if (config.data instanceof FormData) {
    body = Array.from(config.data.entries())
      .map(([key, value]) => {
        if (value instanceof File) {
          return `${key}=file:${value.name}:${value.size}:${value.lastModified}`
        }
        return `${key}=${String(value)}`
      })
      .join('&')
  } else if (config.data) {
    body = JSON.stringify(config.data)
  }
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}:${body}`
}

function clearPendingRequest(config) {
  if (!config?._requestKey) return
  const current = pendingRequests.get(config._requestKey)
  if (current?.source === config._requestSource) {
    pendingRequests.delete(config._requestKey)
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

apiClient.CancelToken = axios.CancelToken
apiClient.isCancel = axios.isCancel

// Normalize URLs and enforce explicit mutation contracts.
apiClient.interceptors.request.use(config => {
  config._sessionGeneration = sessionGeneration()
  // Keep multipart bodies intact; Axios supplies the browser boundary.
  if (config.data instanceof FormData) config.headers.delete('Content-Type')

  // Append trailing slash to path if not already present, but preserve query string
  if (config.url) {
    const [pathPart, queryPart] = config.url.split('?')
    if (pathPart && !pathPart.endsWith('/') && !pathPart.endsWith('.json')) {
      config.url = `${pathPart}/${queryPart ? '?' + queryPart : ''}`
    }
  }

  if (requiresOpeningVersion(config)) {
    const explicit = config.data instanceof FormData ? config.data.get('version') : config.data?.version
    const header = config.headers.get('If-Match')
    const value = explicit ?? header?.replace(/^"|"$/g, '')
    if (!/^[1-9]\d*$/.test(String(value ?? '')) || typeof value === 'boolean') {
      throw new axios.AxiosError('يلزم إصدار السجل الذي فتحته؛ أعد تحميله قبل الحفظ', 'OPENING_VERSION_REQUIRED', config)
    }
    if (!header) config.headers.set('If-Match', `"${value}"`)
  }
  const url = config.url || ''
  if (config.timeout === 15000) {
    if (/^\/(backup|bulk-import)(?:\/|$)/.test(url)) config.timeout = 30 * 60 * 1000
    else if (config.responseType === 'blob' || /^\/(prescription|referrals)(?:\/|$)/.test(url)) config.timeout = 5 * 60 * 1000
  }
  config._foreground = config.background !== true && config.method !== 'get'
  config._longOperation = config.timeout > 15000
  if (config._foreground) useLoadingStore().start(config._longOperation)

  // Only create our own cancel source when the caller did not provide one.
  // Overwriting a caller-supplied cancelToken silently breaks their
  // cancellation (see ApiSelect.vue, AsyncSelect.vue, TimeSlotPicker.vue).
  let source = null
  if (!config.cancelToken) {
    source = axios.CancelToken.source()
    config.cancelToken = source.token
  }
  config.cancelToken?.subscribe(reason => { if (!reason.config) reason.config = config })
  config._requestSource = source

  const isPersistent = config.__persistent === true
  const key = getRequestKey(config)

  // A rapid duplicate mutation is the same logical operation. Reuse the
  // first operation's key so the backend can safely collapse both requests.
  for (const [oldKey, value] of uncertainOperations) {
    if (value.expiresAt <= Date.now()) uncertainOperations.delete(oldKey)
  }
  const uncertain = uncertainOperations.get(key)
  if (uncertain && uncertain.expiresAt > Date.now() && !config.idempotencyKey) {
    config.idempotencyKey = uncertain.key
  } else if (uncertain) {
    uncertainOperations.delete(key)
  }
  const previousRequest = pendingRequests.get(key)
  if (
    previousRequest?.idempotencyKey &&
    ['post', 'put', 'patch', 'delete'].includes(config.method)
  ) {
    config.idempotencyKey = previousRequest.idempotencyKey
  }

  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    if (!config.idempotencyKey) config.idempotencyKey = generateIdempotencyKey()
    config.headers['X-Idempotency-Key'] = config.idempotencyKey
  }

  if (!isPersistent) {
    if (config.method !== 'get') {
      if (previousRequest) {
        // Keep the first mutation alive and cancel this duplicate locally.
        // Cancelling the first request can leave the server committing an
        // operation whose UI promise was discarded, while the retry receives
        // a duplicate-key response and looks like a failure.
        source?.cancel('Duplicate request')
        config._duplicateRequest = true
      }
    }
    if (source && !config._duplicateRequest) {
      pendingRequests.set(key, { source, method: config.method, idempotencyKey: config.idempotencyKey })
    }
  } else {
    // Store the source so we can delete it later; storing the token instead
    // would never match on delete and leak the set.
    if (source) persistentRequests.add(source)
  }

  config._requestKey = key
  config._isPersistent = isPersistent

  const csrfToken = getCookie('csrftoken')
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

apiClient.interceptors.response.use(
  response => {
    if (response.config._foreground && response.config._sessionGeneration === sessionGeneration()) useLoadingStore().stop(response.config._longOperation)
    if (response.config._sessionGeneration !== sessionGeneration()) throw new axios.CanceledError('Session changed', response.config)

    const cfg = response.config
    uncertainOperations.delete(cfg._requestKey)
    if (cfg._isPersistent) {
      if (cfg._requestSource) persistentRequests.delete(cfg._requestSource)
    } else {
      clearPendingRequest(cfg)
    }

    if (response.headers['x-permissions-updated'] === 'true') {
      // Emit semantic event; the app layer (registerApiHandlers) decides
      // whether to re-fetch the current user.
      emit(API_EVENTS.PERMISSIONS_UPDATED)
    }

    return response
  },
  async error => {
    if (error.config?._foreground && error.config._sessionGeneration === sessionGeneration()) useLoadingStore().stop(error.config._longOperation)

    // Download endpoints use responseType=blob. Axios therefore also exposes
    // structured JSON failures as Blob objects; normalize those before the
    // shared handler reads the standard error envelope.
    if (error.response?.data instanceof Blob) {
      const contentType = error.response.data.type || error.response.headers?.['content-type'] || ''
      if (contentType.includes('json')) {
        try {
          error.response.data = JSON.parse(await error.response.data.text())
        } catch {
          // Keep the original Blob and let the generic fallback handle it.
        }
      }
    }

    const config = error.config
    const stale = config && config._sessionGeneration !== sessionGeneration()
    if (!stale && !config?._duplicateRequest && config?.idempotencyKey && config._requestKey && (!error.response || error.response.status >= 500 || ['operation_interrupted', 'recovery_interrupted', 'operation_expired', 'operation_result_unavailable'].includes(error.response?.data?.error?.code))) {
      uncertainOperations.set(config._requestKey, { key: config.idempotencyKey, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 })
    }
    if (config?._isPersistent) {
      if (config._requestSource) persistentRequests.delete(config._requestSource)
    } else if (config?._requestKey) {
      clearPendingRequest(config)
    }

    if (stale) return Promise.reject(new axios.CanceledError('Session changed', config))
    if (axios.isCancel(error)) return Promise.reject(error)

    if (error.response && error.response.status === 409) {
      // Optimistic-lock conflict. Emit an event; the app layer shows the
      // refresh dialog and re-navigates. Keeps apiClient free of the
      // confirm dialog and the router.
      if (['version_conflict', 409].includes(error.response?.data?.error?.code)) {
        emit(API_EVENTS.CONFLICT, error)
        return Promise.reject(error)
      }
    }

    handleApiError(error, { fallbackMsg: MSG_NETWORK_ERROR })

    return Promise.reject(error)
  }
)

onSessionChange(() => {
  useLoadingStore().reset()
  for (const request of pendingRequests.values()) {
    if (request.method === 'get') request.source?.cancel('Session changed')
  }
  for (const source of persistentRequests) source.cancel('Session changed')
  pendingRequests.clear()
  persistentRequests.clear()
  uncertainOperations.clear()
})

// ----- Named exports -----
function cancelAllPending() {
  for (const [, request] of pendingRequests.entries()) {
    if (request.method === 'get') {
      request.source?.cancel('Navigation cancelled')
    }
  }
}

function cancelPendingRequests(urlPattern = '') {
  for (const [key, request] of pendingRequests.entries()) {
    const method = key.split(':')[0]
    if (method === 'get' && (!urlPattern || key.includes(urlPattern))) {
      request.source?.cancel('Request cancelled')
      pendingRequests.delete(key)
    }
  }
}

/**
 * Unwraps a backend envelope of the form `{ data: <payload> }` — or
 * `{ data: { data: <payload> } }` — down to the payload.
 *
 * Uses `??` rather than `||` so that a legitimate falsy payload (`0`, `''`,
 * `false`) isn't skipped over in favour of the surrounding envelope. The
 * previous `||` form silently returned the wrapper object for those values,
 * which was a bug the individual per-file `unwrapPayload` helpers had
 * already worked around independently.
 */
function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response
}

function resetIdempotencyKey() {
  // No-op – keys are managed automatically.
}

export default apiClient
export {
  cancelAllPending,
  cancelPendingRequests,
  generateIdempotencyKey,
  resetIdempotencyKey,
  unwrapResponse,
}
