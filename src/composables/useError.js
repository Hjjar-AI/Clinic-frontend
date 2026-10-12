import { reportError } from '@/utils/reportError'
import { ref } from 'vue'

import { useNotify } from '@/composables/useNotify'

export function useError() {
  const { notify } = useNotify()
  const hasGlobalError = ref(false)

  function handleError(error, _context = '') {
    reportError('useError', error)
    hasGlobalError.value = true
    notify('حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'danger', 8000)
  }

  function clearError() { hasGlobalError.value = false }

  return { hasGlobalError, handleError, clearError }
}