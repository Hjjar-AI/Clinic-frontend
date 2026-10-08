import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { useFloatingPosition } from '@/composables/useFloatingPosition'

export function useDropdown() {
  const triggerRef = ref(null)
  const open = ref(false)
  const { panelRef, positionStyle, recalculate, observeTrigger } = useFloatingPosition(triggerRef, { active: open })
  const element = value => value?.$el || value

  function toggle() { open.value = !open.value }
  function close() { open.value = false }
  function handleOutside(event) {
    if (!element(triggerRef.value)?.contains(event.target) && !element(panelRef.value)?.contains(event.target)) close()
  }
  async function handleKey(event) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    close()
    await nextTick()
    element(triggerRef.value)?.querySelector('button, [href], [tabindex="0"]')?.focus()
  }
  function cleanup() {
    document.removeEventListener('pointerdown', handleOutside)
    document.removeEventListener('keydown', handleKey)
  }
  watch(open, value => {
    cleanup()
    if (value) {
      document.addEventListener('pointerdown', handleOutside)
      document.addEventListener('keydown', handleKey)
    }
  })
  onBeforeUnmount(cleanup)
  return { triggerRef, panelRef, open, positionStyle, toggle, close, recalculate, observeTrigger }
}