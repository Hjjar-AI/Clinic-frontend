import { nextTick, onBeforeUnmount, ref, unref, watch } from 'vue'

// Fixed coordinates are runtime geometry; visual styling lives in CSS.
export function useFloatingPosition(triggerRef, options = {}) {
  const { maxWidth = 360, maxHeight = 400, gap = 4, placement = 'start', active = true } = options
  const panelRef = ref(null)
  const positionStyle = ref({})
  let observer = null
  let frame = null
  let listening = false
  let disposed = false
  const element = value => unref(value)?.$el || unref(value)

  function recalculate() {
    const trigger = element(triggerRef)
    const panel = element(panelRef)
    if (!trigger?.getBoundingClientRect || !panel?.getBoundingClientRect) return
    const viewport = window.visualViewport
    const originX = viewport?.offsetLeft || 0
    const originY = viewport?.offsetTop || 0
    const vw = viewport?.width || window.innerWidth
    const vh = viewport?.height || window.innerHeight
    const margin = 8
    const rect = trigger.getBoundingClientRect()
    const bounds = panel.getBoundingClientRect()
    const widthLimit = Math.max(0, Math.min(maxWidth, vw - margin * 2))
    const width = Math.min(bounds.width, widthLimit)
    const rtl = getComputedStyle(trigger).direction === 'rtl'
    const alignRight = placement === 'end' ? !rtl : rtl
    const desiredLeft = alignRight ? rect.right - width : rect.left
    const left = Math.max(originX + margin, Math.min(desiredLeft, originX + vw - width - margin))
    const below = Math.max(0, originY + vh - rect.bottom - gap - margin)
    const above = Math.max(0, rect.top - originY - gap - margin)
    const naturalHeight = Math.min(maxHeight, Math.max(bounds.height, panel.scrollHeight))
    const flip = naturalHeight > below && above > below
    const available = Math.min(maxHeight, flip ? above : below)
    const height = Math.min(naturalHeight, available)
    const top = Math.max(originY + margin, flip ? rect.top - gap - height : rect.bottom + gap)
    positionStyle.value = {
      top: `${top}px`, left: `${left}px`,
      maxWidth: `${widthLimit}px`, maxHeight: `${available}px`,
    }
  }

  function schedule() {
    if (frame !== null) return
    frame = requestAnimationFrame(() => { frame = null; recalculate() })
  }

  function cleanup() {
    observer?.disconnect()
    observer = null
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    if (!listening) return
    window.removeEventListener('resize', schedule)
    document.removeEventListener('scroll', schedule, true)
    window.visualViewport?.removeEventListener('resize', schedule)
    window.visualViewport?.removeEventListener('scroll', schedule)
    listening = false
  }

  async function observeTrigger() {
    await nextTick()
    cleanup()
    if (disposed || !unref(active) || !element(triggerRef) || !element(panelRef)) return
    recalculate()
    if (window.ResizeObserver) {
      observer = new ResizeObserver(schedule)
      observer.observe(element(triggerRef))
      observer.observe(element(panelRef))
    }
    window.addEventListener('resize', schedule, { passive: true })
    document.addEventListener('scroll', schedule, { capture: true, passive: true })
    window.visualViewport?.addEventListener('resize', schedule, { passive: true })
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true })
    listening = true
  }

  watch([() => unref(active), panelRef], observeTrigger, { flush: 'post', immediate: true })
  onBeforeUnmount(() => { disposed = true; cleanup() })
  return { panelRef, positionStyle, recalculate, observeTrigger, cleanup }
}