import { useNotify } from '@/composables/useNotify'

function copyText(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject)
    } else {
      // Fallback for older browsers or non‑secure contexts
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

export function useCopy() {
  const { notify } = useNotify()
  async function copy(text) {
    try {
      await copyText(String(text))
      notify('تم النسخ', 'success')
    } catch {
      notify('تعذر النسخ', 'danger')
    }
  }
  return { copy }
}