import { onBeforeUnmount, ref } from 'vue'

import { onSessionChange } from '@/services/sessionState'

/** Own a preview URL; callers still guard asynchronous results and issuance. */
export function useObjectUrl() {
  const url = ref('')
  function clear() {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = ''
  }
  function replace(blob) {
    const next = URL.createObjectURL(blob)
    clear()
    url.value = next
    return next
  }
  const remove = onSessionChange(clear)
  onBeforeUnmount(() => {
    clear()
    remove()
  })
  return { url, replace, clear }
}
