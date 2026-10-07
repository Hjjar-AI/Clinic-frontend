import { useNotify } from '@/composables/useNotify'

function copyText(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject)
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        document.body.removeChild(textarea)
      }
    }
  })
}

export default {
  beforeMount(el, binding) {
    const handler = async () => {
      const text = typeof binding.value === 'function' ? binding.value() : binding.value
      if (!text) return
      try {
        await copyText(String(text))
        const { notify } = useNotify()
        notify('تم النسخ', 'success', { duration: 2000 })
      } catch {
        const { notify } = useNotify()
        notify('تعذر النسخ', 'danger', { duration: 2000 })
      }
    }
    el.addEventListener('click', handler)
    el._clipboardHandler = handler
  },
  unmounted(el) {
    if (el._clipboardHandler) {
      el.removeEventListener('click', el._clipboardHandler)
      delete el._clipboardHandler
    }
  }
}