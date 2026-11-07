// One keyboard/focus/scroll owner for drawers, dialogs and privacy overlays.
const stack = []
let inertNodes = []
let overflow = ''
export function hasActiveOverlay() { return stack.length > 0 }
function top() { return [...stack].sort((a, b) => a.priority - b.priority || a.order - b.order).at(-1) }
function controls(root) {
  return [...root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
    .filter(el => !el.disabled && el.tabIndex >= 0 && !el.closest('[inert]') && el.getClientRects().length)
}
function focus(entry) { (controls(entry.element)[0] || entry.element).focus({ preventScroll: true }) }
function reconcile() {
  for (const [node, value] of inertNodes) node.inert = value
  inertNodes = []
  const current = top()
  if (!current) return
  // Inert siblings along the path, never an ancestor of the active overlay.
  for (let node = current.element; node && node !== document.body; node = node.parentElement) {
    for (const sibling of node.parentElement?.children || []) {
      if (sibling !== node && !current.outside.includes(sibling)) { inertNodes.push([sibling, sibling.inert]); sibling.inert = true }
    }
  }
}
function keydown(event) {
  const current = top()
  if (!current) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopImmediatePropagation()
    current.close?.()
  } else if (event.key === 'Tab') {
    const items = controls(current.element)
    const first = items[0] || current.element
    const last = items.at(-1) || current.element
    if (!items.length || !current.element.contains(document.activeElement) ||
        (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
    }
  }
}
function focusin(event) {
  const current = top()
  if (current && !current.element.contains(event.target)) focus(current)
}
let sequence = 0
export function registerOverlay({ element, close, priority = 1000, outside = [] }) {
  const entry = { element, close, priority, outside, order: ++sequence, previous: document.activeElement, z: element.style.zIndex }
  if (!stack.length) {
    overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', keydown, true)
    document.addEventListener('focusin', focusin, true)
  }
  stack.push(entry)
  element.style.zIndex = String(priority + stack.filter(item => item.priority === priority).length)
  reconcile()
  if (top() === entry) focus(entry)
  let released = false
  return () => {
    if (released) return
    released = true
    const wasTop = top() === entry
    stack.splice(stack.indexOf(entry), 1)
    element.style.zIndex = entry.z
    reconcile()
    if (!stack.length) {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', keydown, true)
      document.removeEventListener('focusin', focusin, true)
    }
    if (wasTop) {
      const current = top()
      if (entry.previous?.isConnected && !entry.previous.closest('[inert]') &&
          (!current || current.element.contains(entry.previous))) entry.previous.focus({ preventScroll: true })
      else if (current) focus(current)
    }
  }
}
