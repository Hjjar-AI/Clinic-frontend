// frontend/src/composables/useToast.js
import { ref } from 'vue'

import { TOAST_DEFAULTS } from '@/composables/toastConfig'

const toasts = ref([])
let idCounter = 0

export function useToast() {
  function showToast(message, type = 'info', options = {}) {
    const duration = options.duration ?? TOAST_DEFAULTS.duration
    const persistent = options.persistent ?? false
    const actions = options.actions || []

    const normalizedMessage = (message || '').trim()

    // Deduplicate identical toast
    const existingIdx = toasts.value.findIndex(
      t => (t.message || '').trim() === normalizedMessage && t.type === type
    )
    if (existingIdx !== -1) {
      clearTimeout(toasts.value[existingIdx]._timeout)
      toasts.value.splice(existingIdx, 1)
    }

    const id = ++idCounter
    const toast = { id, message, type, persistent, duration, actions, _timeout: null }
    toasts.value.push(toast)

    if (window.__announce) window.__announce(message)

    if (!persistent) {
      toast._timeout = setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, duration)
    }
  }

  function removeToast(id) {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      clearTimeout(toast._timeout)
      toasts.value = toasts.value.filter(t => t.id !== id)
    }
  }

  function clearAllToasts() {
    toasts.value.forEach(t => clearTimeout(t._timeout))
    toasts.value = []
  }

  return { toasts, showToast, removeToast, clearAllToasts }
}