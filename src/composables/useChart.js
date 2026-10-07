// frontend/src/composables/useChart.js
import { onBeforeUnmount,ref } from 'vue'

import { useFormatters } from '@/composables/useFormatters'

let ChartModule = null
const instances = new Set()

function resolveCssVar(value) {
  if (typeof value !== 'string' || !value.startsWith('var(')) return value
  const style = getComputedStyle(document.documentElement)
  const match = value.match(/var\(([^,)]+)/)
  if (!match) return value
  const varName = match[1].trim()
  const resolved = style.getPropertyValue(varName).trim()
  return resolved || value
}

const defaultTooltipStyles = {
  backgroundColor: resolveCssVar('var(--color-surface)'),
  titleColor: resolveCssVar('var(--color-text)'),
  bodyColor: resolveCssVar('var(--color-text-soft)'),
  borderColor: resolveCssVar('var(--color-border)'),
  borderWidth: 1,
  cornerRadius: 8,
  padding: 12,
  boxShadow: resolveCssVar('var(--shadow-tooltip)'),
  titleFont: { family: 'Cairo', size: 13, weight: '600' },
  bodyFont: { family: 'Cairo', size: 12 },
  rtl: true,
  displayColors: true,
  boxWidth: 10,
  boxHeight: 10,
}

const defaultLegendStyles = {
  labels: {
    boxWidth: 10,
    boxHeight: 10,
    padding: 16,
    font: { family: 'Cairo', size: 11 },
    color: resolveCssVar('var(--color-text-soft)'),
    usePointStyle: false,
    boxStrokeWidth: 0,
    borderRadius: 2,
  }
}

export function getChartColors(count = 12) {
  const style = getComputedStyle(document.documentElement)
  const colors = []
  for (let i = 0; i < count; i++) {
    const varName = `--chart-color-${i + 1}`
    let color = style.getPropertyValue(varName).trim()
    if (!color) {
      const fallback = [
        '#3c6e71', '#b84c3c', '#c49a2b', '#4a7c59', '#5a7a9e', '#7a5a8c',
        '#8b5a3c', '#284b63', '#4a7a72', '#944a38', '#9e7a1e', '#526b32'
      ]
      color = fallback[i % fallback.length]
    }
    colors.push(color)
  }
  return colors
}

export function useChart() {
  const loading = ref(false)
  const { toArabicNumerals } = useFormatters()

  async function loadChartJs() {
    if (ChartModule) return ChartModule
    loading.value = true
    try {
      ChartModule = await import('chart.js/auto')
    } catch {
      ChartModule = null
    } finally {
      loading.value = false
    }
    return ChartModule
  }

  async function createChart(canvas, config) {
    const { default: Chart } = await loadChartJs()
    if (!Chart) return null

    const mergedConfig = {
      ...config,
      options: {
        ...config.options,
        plugins: {
          ...config.options?.plugins,
          tooltip: {
            ...defaultTooltipStyles,
            ...config.options?.plugins?.tooltip,
          },
          legend: {
            ...defaultLegendStyles,
            ...config.options?.plugins?.legend,
            labels: {
              ...defaultLegendStyles.labels,
              ...config.options?.plugins?.legend?.labels,
            }
          }
        },
        scales: {
          ...config.options?.scales,
        }
      }
    }

    if (mergedConfig.options?.scales) {
      for (const key in mergedConfig.options.scales) {
        const axis = mergedConfig.options.scales[key]
        if (axis.ticks) {
          axis.ticks.callback = (value) => toArabicNumerals(value)
        }
      }
    }

    const chart = new Chart(canvas, mergedConfig)
    instances.add(chart)
    return chart
  }

  function destroyChart(chart) {
    if (chart) {
      chart.destroy()
      instances.delete(chart)
    }
  }

  function destroyAll() {
    for (const chart of instances) chart.destroy()
    instances.clear()
  }

  onBeforeUnmount(() => {
    destroyAll()
  })

  return { loading, loadChartJs, createChart, destroyChart, destroyAll }
}