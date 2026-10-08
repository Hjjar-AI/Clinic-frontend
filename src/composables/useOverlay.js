import { nextTick, onBeforeUnmount, watch } from 'vue'
import { registerOverlay } from '@/services/overlayStack'

export function useOverlay(visible, element, close, priority = 1000, outside = () => []) {
  let release
  watch(visible, async (open, old, onCleanup) => {
    let cancelled = false
    onCleanup(() => { cancelled = true; release?.(); release = undefined })
    if (!open) return
    await nextTick()
    if (!cancelled && element()) release = registerOverlay({ element: element(), close, priority, outside: outside() })
  }, { immediate: true })
  onBeforeUnmount(() => release?.())
}
