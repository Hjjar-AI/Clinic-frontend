// frontend/src/composables/useConfirmDialog.js
import { useConfirmStore } from '@/stores/confirm'

/**
 * Simplifies confirmation dialogs.
 * Returns a `confirm` function that shows a modal and resolves a boolean.
 *
 * Usage:
 *   const { confirm } = useConfirmDialog()
 *   const ok = await confirm('هل أنت متأكد؟', { confirmText: 'نعم', cancelText: 'إلغاء' })
 */
export function useConfirmDialog() {
  const confirmStore = useConfirmStore()

  async function confirm(message, options = {}) {
    return confirmStore.confirm(message, {
      ...options,
      title: options.title || 'تأكيد',
      confirmText: options.confirmText || 'نعم',
      cancelText: options.cancelText || 'إلغاء',
      headerVariant: options.headerVariant || 'danger',
      requireCheckbox: options.requireCheckbox || false,
      checkboxLabel: options.checkboxLabel || 'أفهم العواقب',
    })
  }

  async function prompt(message, options = {}) {
    const result = await confirmStore.confirm(message, {
      ...options,
      input: {
        label: options.inputLabel || 'السبب',
        required: options.required !== false,
        maxLength: options.maxLength || 500,
      },
    })
    return typeof result === 'string' ? result.trim() : null
  }

  return { confirm, prompt }
}
