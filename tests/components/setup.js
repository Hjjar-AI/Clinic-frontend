import { afterEach, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia, disposePinia } from 'pinia'
import { enableAutoUnmount, config } from '@vue/test-utils'
import apiClient, { cancelAllPending } from '@/services/apiClient'
import { useToast } from '@/composables/useToast'
let pinia
// jsdom intentionally has no layout; only DOM focus/semantics are asserted here.
enableAutoUnmount(afterEach)
config.global.directives = { 'auto-title': {} }
beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  config.global.plugins = [pinia]
  document.body.innerHTML = ''
  localStorage.clear()
  sessionStorage.clear()
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  window.__announce = vi.fn()
  apiClient.defaults.adapter = async config => { throw new Error(`Unexpected network: ${config.url}`) }
})
afterEach(() => {
  cancelAllPending()
  useToast().clearAllToasts()
  disposePinia(pinia)
  vi.useRealTimers()
})
