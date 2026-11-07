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
  function panelControls() {
    return [...(element(panelRef.value)?.querySelectorAll('button, [href], [tabindex="0"]') || [])]
      .filter(control => !control.disabled)
  }
  async function onTriggerKey(event) {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
    event.preventDefault()
    open.value = true
    await observeTrigger()
    await nextTick()
    if (!open.value) return
    const controls = panelControls()
    ;(event.key === 'ArrowUp' ? controls.at(-1) : controls[0])?.focus()
  }
  async function handleKey(event) {
    if (element(panelRef.value)?.contains(event.target) && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const controls = panelControls()
      const index = controls.indexOf(document.activeElement)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + controls.length) % controls.length
      controls[next]?.focus()
      return
    }
    if (event.key !== 'Escape') return
    event.preventDefault()
    close()
    await nextTick()
    element(triggerRef.value)?.querySelector('button, [href], [tabindex="0"]')?.focus()
  }
  function cleanup() {
    document.removeEventListener('pointerdown', handleOutside)
    document.removeEventListener('keydown', handleKey)
    document.removeEventListener('focusin', handleOutside)
  }
  watch(open, value => {
    cleanup()
    if (value) {
      document.addEventListener('pointerdown', handleOutside)
      document.addEventListener('keydown', handleKey)
      document.addEventListener('focusin', handleOutside)
    }
  })
  onBeforeUnmount(cleanup)
  return { triggerRef, panelRef, open, positionStyle, toggle, close, recalculate, observeTrigger, onTriggerKey }
}
