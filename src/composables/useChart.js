import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useFormatters } from '@/composables/useFormatters'

let chartModulePromise = null
const fallbackColors = [
  '#3c6e71', '#b84c3c', '#c49a2b', '#4a7c59', '#5a7a9e', '#7a5a8c',
  '#8b5a3c', '#284b63', '#4a7a72', '#944a38', '#9e7a1e', '#526b32',
]

function color(name, element = document.body) {
  return getComputedStyle(element).getPropertyValue(name).trim()
}

export function getChartColors(count = 12, element = document.body) {
  return Array.from({ length: count }, (_, index) =>
    color(`--chart-color-${index % 12 + 1}`, element) || fallbackColors[index % fallbackColors.length])
}

export function useChart() {
  const loading = ref(false)
  const presentationVersion = ref(0)
  const instances = new Set()
  const { toArabicNumerals } = useFormatters()
  let disposed = false
  let observer = null
  let compact = window.innerWidth <= 600

  async function loadChartJs() {
    loading.value = true
    if (!chartModulePromise) {
      chartModulePromise = import('chart.js/auto').catch(error => { chartModulePromise = null; throw error })
    }
    try { return await chartModulePromise }
    finally { loading.value = false }
  }

  async function createChart(canvas, config) {
    let module
    try { module = await loadChartJs() }
    catch { return null }
    if (disposed || !canvas?.isConnected) return null
    const rtl = getComputedStyle(canvas).direction === 'rtl'
    const tooltip = {
      backgroundColor: color('--color-surface', canvas),
      titleColor: color('--color-text', canvas),
      bodyColor: color('--color-text-soft', canvas),
      borderColor: color('--color-border', canvas),
      borderWidth: 1, cornerRadius: 8, padding: 12,
      titleFont: { family: 'Cairo', size: 13, weight: '600' },
      bodyFont: { family: 'Cairo', size: 12 },
      rtl, textDirection: rtl ? 'rtl' : 'ltr',
      boxWidth: 10, boxHeight: 10,
      ...config.options?.plugins?.tooltip,
    }
    const legend = {
      rtl, textDirection: rtl ? 'rtl' : 'ltr',
      position: compact ? 'bottom' : (rtl ? 'right' : 'left'),
      ...config.options?.plugins?.legend,
      labels: {
        boxWidth: 10, boxHeight: 10, padding: 12,
        font: { family: 'Cairo', size: 11 },
        color: color('--color-text-soft', canvas),
        ...config.options?.plugins?.legend?.labels,
      },
    }
    const scales = Object.fromEntries(Object.entries(config.options?.scales || {}).map(([key, axis]) => [key, {
      ...axis,
      ticks: {
        color: color('--color-text-muted', canvas),
        ...(key === 'y' ? { callback: value => toArabicNumerals(value) } : {}),
        ...axis.ticks,
      },
      grid: { color: color('--color-border-subtle', canvas), ...axis.grid },
    }]))
    for (const owned of [...instances]) {
      if (owned.canvas === canvas) destroyChart(owned)
    }
    const chart = new module.default(canvas, {
      ...config,
      options: {
        ...config.options,
        plugins: { ...config.options?.plugins, tooltip, legend },
        ...(Object.keys(scales).length ? { scales } : {}),
      },
    })
    instances.add(chart)
    return chart
  }

  function destroyChart(chart) {
    if (chart && instances.delete(chart)) chart.destroy()
  }
  function destroyAll() { for (const chart of [...instances]) destroyChart(chart) }
  function updatePresentation() { presentationVersion.value++ }
  function onResize() {
    const next = window.innerWidth <= 600
    if (next !== compact) { compact = next; updatePresentation() }
  }
  onMounted(() => {
    observer = new MutationObserver(updatePresentation)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'dir'] })
    window.addEventListener('resize', onResize, { passive: true })
  })
  onBeforeUnmount(() => {
    disposed = true
    observer?.disconnect()
    window.removeEventListener('resize', onResize)
    destroyAll()
  })
  return { loading, presentationVersion, loadChartJs, createChart, destroyChart, destroyAll }
}