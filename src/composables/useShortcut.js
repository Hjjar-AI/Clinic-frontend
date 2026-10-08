import { onBeforeUnmount, onMounted } from 'vue'
import { hasActiveOverlay } from '@/services/overlayStack'

// A handler returning false leaves the browser shortcut available.
export function useShortcut({ key, ctrl = false, alt = false, allowInInput = false, handler }) {
  function keydown(event) {
    if (event.defaultPrevented || event.repeat || event.isComposing || hasActiveOverlay() ||
        event.metaKey || event.shiftKey || event.ctrlKey !== ctrl || event.altKey !== alt ||
        event.key.toLowerCase() !== key.toLowerCase()) return
    if (!allowInInput && event.target?.closest('input, textarea, select, [contenteditable="true"]')) return
    if (handler(event) !== false) event.preventDefault()
  }
  onMounted(() => document.addEventListener('keydown', keydown, { passive: false }))
  onBeforeUnmount(() => document.removeEventListener('keydown', keydown))
}
