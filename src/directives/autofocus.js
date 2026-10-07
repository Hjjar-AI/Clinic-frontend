export default {
  mounted(el) {
    const input = el.querySelector('input:not([readonly]), textarea:not([readonly]), select:not([disabled])')
    if (input) input.focus()
  }
}