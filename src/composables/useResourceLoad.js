import { onBeforeUnmount, ref } from 'vue'
/** A form can submit only after its opening resource/version was loaded. */
export function useResourceLoad(initialReady = false) {
  const ready = ref(initialReady), error = ref('')
  let disposed = false, generation = 0, loader
  onBeforeUnmount(() => { disposed = true; generation += 1 })
  async function load(callback = loader) {
    if (!callback || disposed) return false
    loader = callback
    const request = ++generation
    const current = () => !disposed && request === generation
    ready.value = false; error.value = ''
    try {
      await callback(current)
      if (!current()) return false
      ready.value = true
      return true
    } catch {
      if (current()) error.value = 'تعذر تحميل البيانات؛ أعد المحاولة قبل الحفظ'
      return false
    }
  }
  return { ready, error, load, retry: () => load() }
}
