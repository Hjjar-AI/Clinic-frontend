export default {
  beforeMount(el, binding) {
    const delay = parseInt(binding.arg) || 300
    let timer
    const handler = (e) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value(e)
      }, delay)
    }
    el.addEventListener('input', handler)
    el._debounceCleanup = () => {
      clearTimeout(timer)
      el.removeEventListener('input', handler)
    }
  },
  unmounted(el) {
    if (el._debounceCleanup) {
      el._debounceCleanup()
      delete el._debounceCleanup
    }
  }
}