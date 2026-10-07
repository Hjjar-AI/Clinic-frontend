import { ref } from 'vue'

import { useNotify } from '@/composables/useNotify'

export function useError() {
  const { notify } = useNotify()
  const hasGlobalError = ref(false)

  function handleError(error, context = '') {
    console.error(`[Error] ${context}:`, error)
    hasGlobalError.value = true
    notify('حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'danger', 8000)
  }

  function clearError() { hasGlobalError.value = false }

  return { hasGlobalError, handleError, clearError }
}