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
import { onBeforeUnmount,onMounted, ref } from 'vue'

import ChartCard from '@/components/ui/ChartCard.vue'
import { getChartColors,useChart } from '@/composables/useChart'

const props = defineProps({ labels: Array, values: Array })

const chartCanvas = ref(null)
const { createChart, destroyChart } = useChart()
let chartInstance = null

onMounted(async () => {
  if (!chartCanvas.value) return
  const colors = getChartColors(props.labels.length)
  chartInstance = await createChart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.values,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false, beginAtZero: true }
      }
    }
  })
})

onBeforeUnmount(() => {
  if (chartInstance) destroyChart(chartInstance)
})
</script>