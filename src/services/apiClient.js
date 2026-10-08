// frontend/src/services/apiClient.js
import axios from 'axios'

import { API_EVENTS, emit } from '@/services/apiEvents'
import { useLoadingStore } from '@/stores/loading'
import { handleApiError } from '@/utils/apiErrorHandler'
import { MSG_NETWORK_ERROR } from '@/utils/errorMessages'
import { generateIdempotencyKey } from '@/utils/idempotency'

const pendingRequests = new Map()
const persistentRequests = new Set()
const uncertainOperations = new Map()
// Versions are those actually observed by this client. Explicit form versions
// always take precedence, so stale edits continue to produce a conflict.
const observedVersions = new Map()
function resourcePath(url = '') {
  const path = url.split('?')[0]
  const nestedDocuments = path.match(/^(\/patients\/\d+\/documents)\/(\d+)?/)
  if (nestedDocuments) return `${nestedDocuments[1]}/${nestedDocuments[2] ? nestedDocuments[2] + '/' : ''}`
  const nestedVisits = path.match(/^\/patients\/\d+\/visits\/?$/)
  if (nestedVisits) return '/visits/'
  const match = path.match(/^(\/(?:options\/(?:diagnoses|medications)|auth\/users|patients|visits|appointments|tasks|templates|scales|billing(?:\/invoices)?))\/(\d+)?/)
  return match ? `${match[1]}/${match[2] ? match[2] + '/' : ''}` : path === '/settings/' || path === '/settings/theme/' ? '/settings/' : null
}
function observeVersions(response) {
  const path = resourcePath(response.config.url)
  if (!path) return
  const base = path.replace(/\d+\/$/, '')
  const collect = value => {
    if (Array.isArray(value)) { value.forEach(collect); return }
    if (!value || typeof value !== 'object' || value instanceof Blob) return
    if (Number.isInteger(value.version)) {
      observedVersions.set(value.id ? `${base}${value.id}/` : path, value.version)
      return
    }
    for (const key of ['data', 'results', 'items', 'patients', 'visits', 'appointments', 'tasks', 'invoices', 'diagnoses', 'medications', 'scales', 'templates', 'users']) {
      if (value[key]) collect(value[key])
    }
  }
  collect(response.data)
  const parentVersion = Number(response.headers['x-resource-version'])
  if (Number.isInteger(parentVersion) && parentVersion > 0) observedVersions.set(path, parentVersion)
}

// Endpoints that require idempotency enforcement (paths starting with these)
const IDEMPOTENT_URL_PREFIXES = [
  '/appointments/',
  '/billing/',
  '/patients/',
  '/visits/',
  '/tasks/',
  '/prescription/',
  '/backup/',
  '/bulk-import/',
  '/settings/',
  '/auth/users/',
  '/options/',
  '/scales/',
  '/templates/',
  '/referrals/',
]

function isIdempotentUrl(url) {
  return IDEMPOTENT_URL_PREFIXES.some(prefix => url.startsWith(prefix))
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

// Interceptor to ensure trailing slash, convert limit→per_page,
// and optionally add idempotency key if provided by caller.
apiClient.interceptors.request.use(config => {
  // Append trailing slash to path if not already present, but preserve query string
  if (config.url) {
    const [pathPart, queryPart] = config.url.split('?')
    if (pathPart && !pathPart.endsWith('/') && !pathPart.endsWith('.json')) {
      config.url = `${pathPart}/${queryPart ? '?' + queryPart : ''}`
    }
  }

  // Convert 'limit' query param to 'per_page' if not already present
  if (config.method === 'get' && config.params) {
    if (config.params.limit !== undefined && config.params.per_page === undefined) {
      config.params.per_page = config.params.limit
      delete config.params.limit
    }
  }

  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const path = resourcePath(config.url)
    const explicit = config.data instanceof FormData ? config.data.get('version') : config.data?.version
    const version = explicit ?? observedVersions.get(path)
    if (version != null && !config.headers['If-Match']) config.headers['If-Match'] = String(version)
  }
  const loadingStore = useLoadingStore()
  loadingStore.start()

  // Only create our own cancel source when the caller did not provide one.
  // Overwriting a caller-supplied cancelToken silently breaks their
  // cancellation (see ApiSelect.vue, AsyncSelect.vue, TimeSlotPicker.vue).
  let source = null
  if (!config.cancelToken) {
    source = axios.CancelToken.source()
    config.cancelToken = source.token
  }
  config._requestSource = source

  const isPersistent = config.__persistent === true
  const key = getRequestKey(config)

  // A rapid duplicate mutation is the same logical operation. Reuse the
  // first operation's key so the backend can safely collapse both requests.
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

  if (['post', 'put', 'patch', 'delete'].includes(config.method) && isIdempotentUrl(config.url)) {
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
      pendingRequests.set(key, { source, idempotencyKey: config.idempotencyKey })
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
    observeVersions(response)
    useLoadingStore().stop()

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
    useLoadingStore().stop()

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

    if (axios.isCancel(error)) return Promise.reject(error)

    const config = error.config
    if (config?.idempotencyKey && config._requestKey && (!error.response || error.response?.data?.error?.code === 'request_in_progress')) {
      uncertainOperations.set(config._requestKey, { key: config.idempotencyKey, expiresAt: Date.now() + 30 * 60 * 1000 })
    }
    if (config?._isPersistent) {
      if (config._requestSource) persistentRequests.delete(config._requestSource)
    } else if (config?._requestKey) {
      clearPendingRequest(config)
    }

    if (error.response && error.response.status === 409) {
      // Optimistic-lock conflict. Emit an event; the app layer shows the
      // refresh dialog and re-navigates. Keeps apiClient free of the
      // confirm dialog and the router.
      if (!['duplicate_request', 'request_in_progress'].includes(error.response?.data?.error?.code)) {
        emit(API_EVENTS.CONFLICT, error)
        return Promise.reject(error)
      }
    }

    handleApiError(error, { fallbackMsg: MSG_NETWORK_ERROR })

    return Promise.reject(error)
  }
)

// ----- Named exports -----
function cancelAllPending() {
  for (const [, request] of pendingRequests.entries()) {
    request.source?.cancel('Navigation cancelled')
  }
  pendingRequests.clear()
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
