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

const { createChart, destroyChart } = useChart()
const canvasRef = ref(null)
let chartInstance = null

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

const colors = computed(() => {
  const count = typeof props.chartDef.colors === 'function'
    ? props.chartDef.colors(props.stats)
    : props.chartDef.colors
  return getChartColors(count)
})

// Watcher that updates existing chart instead of recreating
watch(
  [() => props.stats, () => props.monthsLabels, () => props.visitsCounts],
  () => {
    if (chartInstance && hasData.value) {
      // Update existing chart datasets and labels
      const labels = chartLabels.value
      const data = chartData.value
      const c = colors.value
      chartInstance.data.labels = labels
      chartInstance.data.datasets[0].data = data
      chartInstance.data.datasets[0].backgroundColor = c
      chartInstance.data.datasets[0].borderColor = props.chartDef.type === 'line' ? c[0] : undefined
      chartInstance.update()
    } else if (!chartInstance && hasData.value) {
      create()
    } else if (chartInstance && !hasData.value) {
      destroyChart(chartInstance)
      chartInstance = null
    }
  },
  { deep: false }  // Avoid deep watch; react to new objects by reference or via computed keys
)

async function create() {
  if (!canvasRef.value || !hasData.value) return
  destroy()
  const config = buildConfig()
  chartInstance = await createChart(canvasRef.value, config)
}

function destroy() {
  if (chartInstance) {
    destroyChart(chartInstance)
    chartInstance = null
  }
}

function buildConfig() {
  const type = props.chartDef.type
  const labels = chartLabels.value
  const data = chartData.value
  const c = colors.value

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
      maintainAspectRatio: true,
      scales: (type === 'bar' || type === 'line') ? { y: { beginAtZero: true, stepSize: 1 } } : undefined,
      plugins: {
        legend: props.chartDef.options?.legend !== false
          ? { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, padding: 12 } }
          : { display: false },
        tooltip: {}
      },
      cutout: props.chartDef.options?.cutout ? props.chartDef.options.cutout : undefined,
    }
  }
  return config
}

onBeforeUnmount(() => {
  destroy()
})
</script>