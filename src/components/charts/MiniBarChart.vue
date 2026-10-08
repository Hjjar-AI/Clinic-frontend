<template>
  <ChartCard
    :has-data="!!labels?.length"
    empty-title="لا توجد بيانات"
  >
    <div class="mini-bar-chart">
      <canvas
        ref="chartCanvas"
        height="80"
      />
    </div>
  </ChartCard>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

import ChartCard from '@/components/ui/ChartCard.vue'
import { getChartColors,useChart } from '@/composables/useChart'

const props = defineProps({ labels: Array, values: Array })

const chartCanvas = ref(null)
const { createChart, destroyChart, presentationVersion } = useChart()
let chartInstance = null
let renderGeneration = 0

watch([chartCanvas, () => props.labels, () => props.values, presentationVersion], async () => {
  const generation = ++renderGeneration
  destroyChart(chartInstance)
  chartInstance = null
  const canvas = chartCanvas.value
  if (!canvas || !props.labels?.length) return
  const colors = getChartColors(props.labels.length, canvas)
  const chart = await createChart(canvas, {
    type: 'bar',
    data: {
      labels: [...props.labels],
      datasets: [{
        data: [...(props.values || [])],
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false, beginAtZero: true }
      }
    }
  })
  if (generation !== renderGeneration || canvas !== chartCanvas.value) destroyChart(chart)
  else chartInstance = chart
}, { deep: true, flush: 'post', immediate: true })

onBeforeUnmount(() => {
  renderGeneration++
  if (chartInstance) destroyChart(chartInstance)
})
</script>