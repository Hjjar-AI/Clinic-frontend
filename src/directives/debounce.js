export default {
  beforeMount(el, binding) {
    el._debounceValue = binding.value
    const delay = parseInt(binding.arg) || 300
    let timer
    const handler = (e) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        el._debounceValue?.(e)
      }, delay)
    }
    el.addEventListener('input', handler)
    el._debounceCleanup = () => {
      clearTimeout(timer)
      el.removeEventListener('input', handler)
    }
  },
  updated(el, binding) { el._debounceValue = binding.value },
  unmounted(el) {
    delete el._debounceValue
    if (el._debounceCleanup) {
      el._debounceCleanup()
      delete el._debounceCleanup
    }
  }
}