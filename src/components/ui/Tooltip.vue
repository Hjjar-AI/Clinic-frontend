<template>
  <span
    ref="triggerRef"
    class="tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot name="trigger" />
    <Transition name="tooltip">
      <span
        v-if="visible"
        class="tooltip"
        role="tooltip"
        :style="positionStyle"
      >
        <slot />
      </span>
    </Transition>
  </span>
</template>

<script setup>
import { ref } from 'vue'

import { useFloatingPosition } from '@/composables/useFloatingPosition'

// `position` prop kept for API compatibility with existing callers.
// The composable always prefers "below, flip up if needed", which matches
// what the previous implementation actually did in practice.
defineProps({ position: { type: String, default: 'top' } })

const visible = ref(false)
const triggerRef = ref(null)
const { positionStyle, recalculate } = useFloatingPosition(triggerRef)

function show() {
  visible.value = true
  recalculate()
}

function hide() {
  visible.value = false
}
</script>