<template>
  <span ref="triggerRef" class="tooltip-wrapper"
    @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide" @keydown.esc="hide">
    <slot name="trigger" />
    <Teleport to="body">
      <Transition name="tooltip">
        <span v-if="visible" :id="tooltipId" ref="panelRef" class="tooltip" role="tooltip" :style="positionStyle">
          <slot />
        </span>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup>
import { onBeforeUnmount, ref, useId, watch } from 'vue'

import { useFloatingPosition } from '@/composables/useFloatingPosition'

defineProps({ position: { type: String, default: 'top' } })
const tooltipId = `tooltip-${useId()}`
const visible = ref(false)
const triggerRef = ref(null)
const { panelRef, positionStyle } = useFloatingPosition(triggerRef, { active: visible, maxWidth: 320 })
function describe(open) {
  const control = triggerRef.value?.querySelector('button, [href], input, select, textarea, [tabindex]') || triggerRef.value
  if (!control) return
  const ids = new Set((control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean))
  if (open) ids.add(tooltipId)
  else ids.delete(tooltipId)
  if (ids.size) control.setAttribute('aria-describedby', [...ids].join(' '))
  else control.removeAttribute('aria-describedby')
}
watch(visible, describe, { flush: 'post' })
onBeforeUnmount(() => describe(false))
function show() { visible.value = true }
function hide() { visible.value = false }
</script>