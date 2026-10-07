<!-- src/components/ui/StatCard.vue -->
<template>
  <div
    ref="cardRef"
    class="card kpi text-center p-3"
    :class="`kpi--${type}`"
  >
    <div
      v-if="icon"
      class="kpi__icon"
    >
      <Icon
        :icon="icon"
        aria-hidden="true"
      />
    </div>
    <p class="text-muted text-xs mb-1">
      {{ label }}
    </p>
    <h2
      class="kpi__number"
      :data-animate="animated ? 'true' : 'false'"
      :data-target="value"
    >
      {{ displayValue }}
    </h2>
    <div
      v-if="trend !== undefined"
      class="kpi__trend"
      :class="trendClass"
    >
      <Icon
        :icon="trendIcon"
        class="kpi__trend-icon"
      />
      <span>{{ Math.abs(trend) }}%</span>
    </div>
    <small
      v-if="subtitle"
      class="text-muted"
    >{{ subtitle }}</small>
    <div
      v-if="sparkValues"
      class="kpi__sparkline"
    >
      <canvas
        ref="sparkCanvas"
        width="80"
        height="30"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick,onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useFormatters } from '@/composables/useFormatters'

const props = defineProps({
  icon: { type: String, default: '' },
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  animate: { type: Boolean, default: true },
  type: { type: String, default: 'patients' },
  subtitle: { type: String, default: '' },
  sparkValues: { type: Array, default: null },
  trend: { type: Number, default: undefined },
})

const { formatNumber } = useFormatters()

const cardRef = ref(null)
const animated = ref(false)
let observer = null

const animatedValue = ref(0)
const displayValue = computed(() => formatNumber(animatedValue.value))

const trendIcon = computed(() => props.trend >= 0 ? 'arrow-up' : 'arrow-down')
const trendClass = computed(() => props.trend >= 0 ? 'trend-up' : 'trend-down')

function animateValue(target) {
  if (!props.animate || !animated.value) {
    animatedValue.value = target
    return
  }
  let start = 0
  const duration = 800
  const step = (timestamp) => {
    if (!start) start = timestamp
    const progress = Math.min((timestamp - start) / duration, 1)
    animatedValue.value = Math.round(target * progress)
    if (progress < 1) requestAnimationFrame(step)
    else animatedValue.value = target
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (cardRef.value && props.animate) {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animated.value = true
          animateValue(props.value)
          observer?.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(cardRef.value)
  } else {
    animated.value = true
    animateValue(props.value)
  }
  drawSparkline()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(() => props.value, (val) => {
  if (animated.value) animateValue(val)
})

const sparkCanvas = ref(null)
function drawSparkline() {
  if (!props.sparkValues || !sparkCanvas.value) return
  const canvas = sparkCanvas.value
  const ctx = canvas.getContext('2d')
  const values = props.sparkValues
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const range = maxVal - minVal || 1
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#5a8a7a'
  ctx.lineWidth = 2
  ctx.beginPath()
  values.forEach((v, i) => {
    const x = (i / (values.length - 1)) * (w - 8) + 4
    const y = h - 4 - ((v - minVal) / range) * (h - 8)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
}
watch(() => props.sparkValues, () => {
  nextTick(() => drawSparkline())
})
</script>