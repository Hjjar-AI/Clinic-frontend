// frontend/src/composables/useDropdown.js
import { onBeforeUnmount,onMounted, ref } from 'vue'

import { useFloatingPosition } from '@/composables/useFloatingPosition'

/**
 * Minimal dropdown controller: tracks an open flag, computes the panel's
 * fixed position from a trigger element, and closes on outside-click.
 *
 * Positioning is delegated to `useFloatingPosition` — the same composable
 * used by `Tooltip.vue`. Previously both files duplicated the calculation
 * and drifted.
 */
export function useDropdown() {
  const triggerRef = ref(null)
  const open = ref(false)
  const { positionStyle, recalculate, observeTrigger } = useFloatingPosition(triggerRef)

  function toggle() {
    open.value = !open.value
    if (open.value) recalculate()
  }

  function close() {
    open.value = false
  }

  function handleClickOutside(event) {
    const trigger = triggerRef.value?.$el || triggerRef.value
    if (trigger && !trigger.contains(event.target)) {
      close()
    }
  }

  onMounted(() => document.addEventListener('click', handleClickOutside))
  onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

  return {
    triggerRef,
    open,
    positionStyle,
    toggle,
    close,
    recalculate,
    observeTrigger,
  }
}