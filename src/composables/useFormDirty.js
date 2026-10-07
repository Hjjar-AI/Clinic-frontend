// frontend/src/composables/useFormDirty.js
import { onBeforeRouteLeave } from 'vue-router'

import { useConfirmStore } from '@/stores/confirm'

/**
 * Registers a route-leave guard that prompts the user when there are
 * unsaved changes.
 *
 * The `isDirty` argument must be a Vue ref/computed. In practice this is
 * the `isDirty` returned by `useForm` (VeeValidate-backed) or a local ref
 * for forms that don't use `useForm`. This composable no longer creates
 * its own dirty-tracking ref — having three parallel sources
 * (`useForm.isDirty`, this composable's own ref, and
 * `useFormSubmission.isDirty`) produced false "unsaved changes" prompts
 * after successful saves.
 *
 * @param {import('vue').Ref<boolean>} isDirtyRef
 * @returns {{ isDirty: import('vue').Ref<boolean>, stop: () => void }}
 */
export function useFormDirty(isDirtyRef) {
  if (!isDirtyRef || typeof isDirtyRef !== 'object' || !('value' in isDirtyRef)) {
    throw new Error(
      'useFormDirty: expected a Vue ref/computed (e.g. `isDirty` from useForm).'
    )
  }

  const confirmStore = useConfirmStore()

  onBeforeRouteLeave(async (to, from, next) => {
    if (isDirtyRef.value) {
      const ok = await confirmStore.confirm(
        'لديك تغييرات غير محفوظة. هل تريد المغادرة؟',
        {
          confirmText: 'مغادرة',
          cancelText: 'البقاء',
          headerVariant: 'warning',
        }
      )
      if (ok) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  })

  return { isDirty: isDirtyRef, stop: () => {} }
}