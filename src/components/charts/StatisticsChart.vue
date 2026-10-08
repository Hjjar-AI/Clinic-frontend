<!-- frontend/src/components/charts/StatisticsChart.vue -->
<template>
  <ChartCard
    :title="chartDef.title"
    :icon="chartDef.icon"
    :has-data="hasData"
    :empty-title="chartDef.emptyTitle || 'لا توجد بيانات'"
  >
    <canvas
      ref="canvasRef"
      height="200"
    />
  </ChartCard>
</template>

<script setup>
import { computed, onBeforeUnmount,ref, watch } from 'vue'

import ChartCard from '@/components/ui/ChartCard.vue'
import { getChartColors,useChart } from '@/composables/useChart'

const props = defineProps({
  chartDef: Object,
  stats: Object,
  monthsLabels: Array,
  visitsCounts: Array,
})

const { createChart, destroyChart, presentationVersion } = useChart()
const canvasRef = ref(null)
let chartInstance = null
let renderGeneration = 0

const hasData = computed(() => {
  const labels = typeof props.chartDef.labels === 'function'
    ? props.chartDef.labels(props.stats, props.monthsLabels, props.visitsCounts)
    : props.chartDef.labels
  const data = typeof props.chartDef.data === 'function'
    ? props.chartDef.data(props.stats, props.monthsLabels, props.visitsCounts)
    : props.chartDef.data
  return (labels?.length || data?.length) > 0
})

const chartLabels = computed(() => {
  return typeof props.chartDef.labels === 'function'
    ? props.chartDef.labels(props.stats, props.monthsLabels, props.visitsCounts)
    : props.chartDef.labels
})

const chartData = computed(() => {
  return typeof props.chartDef.data === 'function'
    ? props.chartDef.data(props.stats, props.monthsLabels, props.visitsCounts)
    : props.chartDef.data
})

const colorCount = computed(() => {
  const count = typeof props.chartDef.colors === 'function'
    ? props.chartDef.colors(props.stats)
    : props.chartDef.colors
  return count
})

// React to in-place data changes and wait for ChartCard's conditional canvas.
watch(
  [canvasRef, chartLabels, chartData, colorCount, () => props.chartDef, presentationVersion],
  async () => {
    const generation = ++renderGeneration
    destroy()
    const canvas = canvasRef.value
    if (!canvas || !hasData.value) return
    const chart = await createChart(canvas, buildConfig())
    if (generation !== renderGeneration || canvas !== canvasRef.value) destroyChart(chart)
    else chartInstance = chart
  },
  { deep: true, flush: 'post', immediate: true },
)

function destroy() {
  destroyChart(chartInstance)
  chartInstance = null
}

function buildConfig() {
  const type = props.chartDef.type
  const labels = [...(chartLabels.value || [])]
  const data = [...(chartData.value || [])]
  const c = getChartColors(colorCount.value, canvasRef.value || document.body)

  const config = {
    type,
    data: {
      labels,
      datasets: [{
        label: '',
        data,
        backgroundColor: c,
        borderWidth: type === 'line' ? 2 : 0,
        borderColor: type === 'line' ? c[0] : undefined,
        borderRadius: type === 'bar' ? 6 : undefined,
        tension: type === 'line' ? 0.3 : undefined,
        fill: props.chartDef.options?.fill ? true : false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: (type === 'bar' || type === 'line') ? { y: { beginAtZero: true, ticks: { stepSize: 1 } } } : undefined,
      plugins: {
        legend: props.chartDef.options?.legend !== false
          ? { labels: { font: { family: 'Cairo', size: 11 }, boxWidth: 10, padding: 12 } }
          : { display: false },
        tooltip: {}
      },
      cutout: props.chartDef.options?.cutout ? props.chartDef.options.cutout : undefined,
    }
  }
  return config
}

onBeforeUnmount(() => {
  renderGeneration++
  destroy()
})
</script>