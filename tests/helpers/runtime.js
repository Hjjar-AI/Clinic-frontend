import { beforeEach, afterEach } from 'node:test'
import { createPinia, setActivePinia, disposePinia } from 'pinia'
import apiClient, { cancelAllPending } from '@/services/apiClient'
import { useToast } from '@/composables/useToast'
import { createApp } from 'vue'
import { changeSession, sessionStorePlugin } from '@/services/sessionState'
import { clearAllFormDrafts } from '@/composables/useFormDraft'
let pinia
let installed = false
export const requests = []
export function installRuntime() {
  if (installed) return
  installed = true
  beforeEach(() => {
    pinia = createPinia()
    pinia.use(sessionStorePlugin)
    createApp({}).use(pinia)
    setActivePinia(pinia)
    changeSession(null)
    clearAllFormDrafts()
    requests.length = 0
    document.cookie = ''
    localStorage.clear()
    sessionStorage.clear()
    apiClient.defaults.adapter = async config => { throw new Error(`Unexpected network call: ${config.method} ${config.url}`) }
  })
  afterEach(() => {
    changeSession(null)
    cancelAllPending()
    useToast().clearAllToasts()
    for (const store of pinia._s.values()) store.$dispose()
    disposePinia(pinia)
  })
}
export function respond(data = { data: {} }, headers = {}, status = 200) {
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    return { data, headers, status, statusText: 'Suite response', config }
  }
}
export function fail(status, data = { error: { message: 'Synthetic failure' } }) {
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    const error = new Error('Synthetic failure')
    error.config = config
    if (status) error.response = { status, data, headers: {}, config }
    throw error
  }
}
export function body(config = requests.at(-1)) {
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data
}
export function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
export const flush = () => new Promise(resolve => setImmediate(resolve))
