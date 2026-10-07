import { defineStore } from 'pinia'
import { ref } from 'vue'

let resolveId = 0

export const useConfirmStore = defineStore('confirm', () => {
  const queue = ref([])
  const active = ref(null)

  function confirm(message, options = {}) {
    return new Promise((resolve) => {
      const id = ++resolveId
      const entry = {
        id,
        message,
        options: {
          title: options.title || 'تأكيد',
          confirmText: options.confirmText || 'نعم',
          cancelText: options.cancelText || 'إلغاء',
          headerVariant: options.headerVariant || 'danger',
          requireCheckbox: options.requireCheckbox || false,
          checkboxLabel: options.checkboxLabel || 'أفهم العواقب',
          input: options.input || null,
        },
        resolve
      }
      queue.value.push(entry)
      next()
    })
  }

  function next() {
    if (active.value || queue.value.length === 0) return
    active.value = queue.value.shift()
  }

  function onConfirm(value = true) {
    if (active.value) {
      active.value.resolve(active.value.options.input ? value : true)
      active.value = null
      next()
    }
  }

  function onCancel() {
    if (active.value) {
      active.value.resolve(false)
      active.value = null
      next()
    }
  }

  return { active, confirm, onConfirm, onCancel }
})
