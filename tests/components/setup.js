import { afterEach, beforeEach, vi } from 'vitest'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia, disposePinia } from 'pinia'
import { enableAutoUnmount, config } from '@vue/test-utils'
import apiClient, { cancelAllPending } from '@/services/apiClient'
import { useToast } from '@/composables/useToast'
import { changeSession, sessionStorePlugin } from '@/services/sessionState'
import { clearAllFormDrafts } from '@/composables/useFormDraft'
let pinia, queryClient
// jsdom intentionally has no layout; only DOM focus/semantics are asserted here.
enableAutoUnmount(afterEach)
config.global.directives = { 'auto-title': {} }
beforeEach(() => {
  pinia = createPinia()
  pinia.use(sessionStorePlugin)
  setActivePinia(pinia)
  changeSession(null)
  clearAllFormDrafts()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } })
  config.global.plugins = [pinia, [VueQueryPlugin, { queryClient }]]
  document.body.innerHTML = ''
  localStorage.clear()
  sessionStorage.clear()
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  window.__announce = vi.fn()
  apiClient.defaults.adapter = async config => { throw new Error(`Unexpected network: ${config.url}`) }
})
afterEach(() => {
  changeSession(null)
  cancelAllPending()
  useToast().clearAllToasts()
  queryClient.clear()
  for (const store of pinia._s.values()) store.$dispose()
  disposePinia(pinia)
  vi.useRealTimers()
})
