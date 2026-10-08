<!-- frontend/src/components/ui/SignaturePad.vue -->
<template>
  <div class="signature-pad-container">
    <div
      ref="padRef"
      class="signature-canvas"
      :class="{
        'signature-canvas--required': required && !hasDrawn,
        'signature-canvas--error': error
      }"
      role="img"
      :aria-label="'توقيع' + (required ? ' (مطلوب)' : '')"
      tabindex="0"
      @mousedown.prevent="startDraw"
      @mousemove.prevent="draw"
      @mouseup="endDraw"
      @mouseleave="endDraw"
      @touchstart.prevent="startDrawTouch"
      @touchmove.prevent="drawTouch"
      @touchend="endDraw"
      @blur="endDraw"
      @keydown.enter.prevent="startKeyboardDraw"
      @keydown.space.prevent="startKeyboardDraw"
      @keydown.up.prevent="moveKeyboardPen('up')"
      @keydown.down.prevent="moveKeyboardPen('down')"
      @keydown.left.prevent="moveKeyboardPen('left')"
      @keydown.right.prevent="moveKeyboardPen('right')"
    >
      <svg
        v-if="hasDrawn"
        ref="svgRef"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        class="signature-preview"
      >
        <path
          v-if="pathData"
          :d="pathData"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-width="2"
        />
      </svg>
    </div>
    <small
      v-if="required && !hasDrawn"
      class="text-danger text-xs mt-1"
    >
      <Icon icon="exclamation-circle" /> التوقيع مطلوب
    </small>
    <div class="flex gap-1 mt-2">
      <button
        type="button"
        class="btn btn--secondary btn--small"
        @click="clear"
      >
        مسح
      </button>
      <button
        type="button"
        class="btn btn--primary btn--small"
        @click="save"
      >
        حفظ التوقيع
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import Icon from '@/components/ui/Icon.vue'

defineProps({
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['save'])

const padRef = ref(null)
const svgRef = ref(null)
const pathData = ref('')
const hasDrawn = ref(false)
const drawing = ref(false)
const points = ref([])
const keyboardPenPos = ref({ x: 150, y: 50 }) // Starting point for keyboard drawing

function getPos(e) {
  const rect = padRef.value.getBoundingClientRect()
  const scaleX = 300 / rect.width
  const scaleY = 100 / rect.height
  const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
  const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

function startDraw(e) {
  drawing.value = true
  const { x, y } = getPos(e)
  points.value = [{ x, y }]
  pathData.value = `M ${x} ${y}`
  hasDrawn.value = true
}

function draw(e) {
  if (!drawing.value) return
  const { x, y } = getPos(e)
  points.value.push({ x, y })
  pathData.value += ` L ${x} ${y}`
}

function endDraw() {
  drawing.value = false
}

function startDrawTouch(e) { startDraw(e) }
function drawTouch(e) { draw(e) }

// Keyboard drawing support
function startKeyboardDraw() {
  if (!hasDrawn.value) {
    // Start a new path at the current pen position
    points.value = [{ ...keyboardPenPos.value }]
    pathData.value = `M ${keyboardPenPos.value.x} ${keyboardPenPos.value.y}`
    hasDrawn.value = true
  } else {
    // Continue drawing by moving pen in the last direction
    const last = points.value[points.value.length - 1]
    if (last) {
      points.value.push({ x: last.x, y: last.y })
      pathData.value += ` L ${last.x} ${last.y}`
    }
  }
}

function moveKeyboardPen(direction) {
  const step = 5
  let newPos = { ...keyboardPenPos.value }
  switch (direction) {
    case 'up': newPos.y = Math.max(0, newPos.y - step); break
    case 'down': newPos.y = Math.min(100, newPos.y + step); break
    case 'left': newPos.x = Math.max(0, newPos.x - step); break
    case 'right': newPos.x = Math.min(300, newPos.x + step); break
  }
  keyboardPenPos.value = newPos

  if (hasDrawn.value) {
    // Continue the path to the new point
    points.value.push({ ...newPos })
    pathData.value += ` L ${newPos.x} ${newPos.y}`
  }
}

function clear() {
  pathData.value = ''
  points.value = []
  hasDrawn.value = false
  keyboardPenPos.value = { x: 150, y: 50 }
}

function save() {
  if (!hasDrawn.value) return

  const d = points.value.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 300 100"
     width="300" height="100">
  <path d="${d}"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>`.trim()

  emit('save', svg)
}
</script>

<style scoped src="../../styles/components/ui/signature-pad.css"></style>
