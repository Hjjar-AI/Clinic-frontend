// frontend/src/composables/useFloatingPosition.js
import { nextTick, onBeforeUnmount, onMounted, ref, unref } from 'vue'

/**
 * Computes a `position: fixed` style for a floating element (tooltip,
 * dropdown, context menu) anchored to a trigger.
 *
 * The same logic previously lived verbatim in two places:
 *   - `components/ui/Tooltip.vue`
 *   - `composables/useDropdown.js`
 *
 * Both copies drifted apart over time. This composable is the single
 * source of truth.
 *
 * @param {import('vue').Ref<HTMLElement|import('vue').ComponentPublicInstance|null>} triggerRef
 * @param {Object} [options]
 * @param {number} [options.maxWidth=360]      Viewport clamp for the panel.
 * @param {number} [options.gap=4]             Space between trigger and panel.
 * @param {number} [options.estimatedHeight=200] Used to decide whether to
 *                                             flip above the trigger.
 * @returns {{
 *   positionStyle: import('vue').Ref<Record<string, string>>,
 *   recalculate: () => void,
 *   observeTrigger: () => Promise<void>,
 *   cleanup: () => void,
 * }}
 */
export function useFloatingPosition(triggerRef, options = {}) {
  const {
    maxWidth = 360,
    gap = 4,
    estimatedHeight = 200,
  } = options

  const positionStyle = ref({
    position: 'fixed',
    zIndex: 'var(--z-tooltip)',
  })

  let resizeObserver = null

  function getTriggerElement() {
    const t = unref(triggerRef)
    if (!t) return null
    // Vue component instance -> its root element.
    return t.$el || t
  }

  function recalculate() {
    const trigger = getTriggerElement()
    if (!trigger || typeof trigger.getBoundingClientRect !== 'function') return

    const rect = trigger.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Default: below the trigger, right-aligned to its right edge.
    let top = Math.min(rect.bottom + gap, vh - 10)
    let right = vw - rect.right

    // Flip above when there is not enough room below.
    if (rect.bottom + estimatedHeight > vh) {
      top = Math.max(rect.top - estimatedHeight - gap, 4)
    }

    // Clamp horizontally so the panel stays on-screen.
    if (right + maxWidth > vw) right = vw - maxWidth - 8
    if (right < 0) right = 4

    positionStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      right: `${right}px`,
      zIndex: 'var(--z-tooltip)',
    }
  }

  async function observeTrigger() {
    await nextTick()
    const trigger = getTriggerElement()
    if (!trigger || !window.ResizeObserver) return
    if (resizeObserver) resizeObserver.disconnect()
    resizeObserver = new ResizeObserver(() => recalculate())
    resizeObserver.observe(trigger)
  }

  function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  onMounted(() => {
    observeTrigger()
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return { positionStyle, recalculate, observeTrigger, cleanup }
}