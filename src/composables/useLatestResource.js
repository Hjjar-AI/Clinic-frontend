import { onBeforeUnmount, ref, shallowRef, toValue, watch } from 'vue'

import { onSessionChange, sessionGeneration } from '@/services/sessionState'

/** Replaceable reads only. Session changes clear without starting another read. */
export function useLatestResource(key, read, message = 'تعذر تحميل البيانات') {
  const data = shallowRef(null),
    loading = ref(false),
    error = ref('')
  let generation = 0,
    disposed = false
  function clear() {
    generation += 1
    data.value = null
    loading.value = false
    error.value = ''
  }
  async function load() {
    if (disposed) return
    const request = ++generation,
      epoch = sessionGeneration(),
      resourceKey = toValue(key)
    const current = () =>
      !disposed && request === generation && epoch === sessionGeneration()
    loading.value = true
    error.value = ''
    try {
      const result = await read(resourceKey)
      if (current()) data.value = result
    } catch {
      if (current()) error.value = message
    } finally {
      if (current()) loading.value = false
    }
  }
  const remove = onSessionChange(clear)
  onBeforeUnmount(() => {
    disposed = true
    clear()
    remove()
  })
  watch(
    () => toValue(key),
    () => {
      clear()
      load()
    },
    { immediate: true },
  )
  return { data, loading, error, load, retry: load, clear }
}
