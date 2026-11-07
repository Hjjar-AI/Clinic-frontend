// frontend/src/composables/useFormSubmission.js
import { useMutation } from '@tanstack/vue-query'
import { computed, ref } from 'vue'

import { extractApiErrors } from '@/utils/errorExtractor'

/**
 * Wraps a form submission API call with Vue Query's useMutation.
 *
 * Dirty tracking is owned by `useForm` (or, for forms that don't use it,
 * by the caller's own ref). This composable no longer keeps its own
 * `isDirty` ref — that was the third parallel source and it disagreed
 * with VeeValidate's tracking after successful saves.
 *
 * After a successful submit, callers should either call `markClean()` on
 * the form (from `useForm`) or set their local dirty ref to `false`.
 *
 * 409 (version conflict) is handled globally by the apiClient interceptor
 * via `API_EVENTS.CONFLICT`; we deliberately do NOT handle it here too.
 *
 * @param {Function} validateFn - returns boolean or Promise<boolean>
 * @param {Function} submitFn   - the async function that performs the API call
 */
export function useFormSubmission(validateFn, submitFn) {
  const submitError = ref('')

  const mutation = useMutation({
    mutationFn: submitFn,
    onError: (error) => {
      submitError.value =
        extractApiErrors(error) || 'فشل الحفظ. يرجى المحاولة مرة أخرى.'
    },
    onSuccess: () => {
      submitError.value = ''
    },
  })

  async function submit() {
    submitError.value = ''
    if (validateFn) {
      const valid = await validateFn()
      if (!valid) return false
    }

    try {
      await mutation.mutateAsync()
      return true
    } catch {
      // error already handled by onError
      return false
    }
  }

  return {
    submit,
    submitError,
    status: mutation.status,
    isSubmitting: computed(() => mutation.status.value === 'pending'),
  }
}