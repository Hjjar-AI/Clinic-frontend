export function debounce(fn, delay) {
  let timeout, args, receiver
  const call = function(...values) {
    args = values; receiver = this
    clearTimeout(timeout)
    timeout = setTimeout(() => { timeout = null; fn.apply(receiver, args) }, delay)
  }
  call.cancel = () => { clearTimeout(timeout); timeout = null }
  call.flush = () => { if (timeout) { call.cancel(); return fn.apply(receiver, args) } }
  return call
}