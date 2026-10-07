export default {
  beforeMount(el, binding) {
    const initial = binding.value   // the initial value passed from the template
    el._dirtyInitial = initial
    // The binding will update reactively; we use updated lifecycle.
  },
  updated(el, binding) {
    const initial = el._dirtyInitial
    const current = binding.value
    if (current !== initial) {
      el.classList.add('is-dirty')
    } else {
      el.classList.remove('is-dirty')
    }
  }
}
