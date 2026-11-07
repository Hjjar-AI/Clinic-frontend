// frontend/src/utils/apiErrorHandler.js
import axios from 'axios'

import { useNotify } from '@/composables/useNotify'
import { API_EVENTS, emit } from '@/services/apiEvents'

/**
 * Centralised API error handler.
 *
 * Pure with respect to app state: it only shows toasts and emits semantic
 * events (UNAUTHORIZED, FORBIDDEN, NETWORK_ERROR, RATE_LIMITED). Auth
 * teardown and navigation are wired up in
 * `@/bootstrap/registerApiHandlers`, which keeps the HTTP layer free of
 * store/router imports and eliminates the previous circular dependency
 * between apiClient and authStore.
 *
 * Returns `true` when the error was handled (caller should not further
 * process it), `false` when the caller (typically a form) should handle it.
 */
export function handleApiError(error, options = {}) {
  const { notify } = useNotify()
  const { silent = false, fallbackMsg } = options

  if (axios.isCancel(error)) return true

  if (!error.response || error.code === 'ECONNABORTED' || !navigator.onLine) {
    if (!silent) {
      notify('فشل الاتصال بالخادم. تحقق من الشبكة.', 'danger', { persistent: true })
    }
    emit(API_EVENTS.NETWORK_ERROR, error)
    return true
  }

  const status = error.response.status
  const data = error.response.data

  switch (status) {
    case 401: {
      // Delegate to the app layer: logout + redirect.
      emit(API_EVENTS.UNAUTHORIZED, error)
      return true
    }
    case 403: {
      if (!silent) notify(data?.error?.message || 'غير مصرح لك بهذا الإجراء.', 'danger')
      emit(API_EVENTS.FORBIDDEN, error)
      return true
    }
    case 404: {
      if (!silent) notify(data?.error?.message || 'المورد المطلوب غير موجود.', 'warning')
      return true
    }
    case 405: {
      if (!silent) notify('الطريقة غير مسموحة لهذا المسار.', 'warning')
      return true
    }
    case 409: {
      if (data?.error?.code === 'duplicate_request' && !silent) {
        notify('العملية قيد التنفيذ أو نُفذت بالفعل.', 'warning')
      }
      return true
    }
    case 413: {
      if (!silent) notify('حجم الملف كبير جداً.', 'danger')
      return true
    }
    case 415: {
      if (!silent) notify('نوع المحتوى غير مدعوم.', 'warning')
      return true
    }
    case 422: {
      const errors = data?.error?.errors || data?.errors
      if (errors) {
        if (!silent) notify(Object.values(errors).flat().join('؛ '), 'danger')
      } else if (!silent) {
        notify(data?.error?.message || 'خطأ في التحقق من البيانات.', 'danger')
      }
      return false   // allow form to handle if needed
    }
    case 429: {
      if (!silent) notify('طلبات كثيرة جداً – حاول بعد قليل', 'warning')
      emit(API_EVENTS.RATE_LIMITED, error)
      return true
    }
    default: {
      if (status >= 500) {
        if (!silent) notify(fallbackMsg || 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.', 'danger', { persistent: true })
        return true
      }
      if (status >= 400) {
        if (!silent) {
          const msg = data?.error?.message || fallbackMsg || 'حدث خطأ في الطلب.'
          notify(msg, 'danger')
        }
        return true
      }
      return false
    }
  }
}
