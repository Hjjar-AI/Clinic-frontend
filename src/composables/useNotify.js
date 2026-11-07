// frontend/src/composables/useNotify.js
import { useToast } from '@/composables/useToast'
import { announce } from '@/utils/announce'

export function useNotify() {
  const { showToast } = useToast()

  function notify(message, type = 'success', options = {}) {
    showToast(message, type, options)
    announce(message)
  }

  return { notify }
}