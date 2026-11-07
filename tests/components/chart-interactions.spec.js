import { afterEach, describe, it, expect, vi } from 'vitest'
import { reactive } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import StatisticsChart from '@/components/charts/StatisticsChart.vue'
import MiniBarChart from '@/components/charts/MiniBarChart.vue'
import { getChartColors } from '@/composables/useChart'

const { created } = vi.hoisted(() => ({ created: [] }))
vi.mock('chart.js/auto', () => ({ default: class {
  constructor(canvas, config) {
    this.canvas = canvas
    this.config = config
    this.destroy = vi.fn()
    created.push(this)
  }
} }))
afterEach(() => {
  created.length = 0
  document.body.classList.remove('dark-mode')
  document.documentElement.removeAttribute('dir')
  document.body.style.removeProperty('--chart-color-1')
  vi.unstubAllGlobals()
})
const definition = { type: 'bar', title: 'Synthetic chart', labels: ['A', 'B'], data: [2, 3], colors: 2 }
async function chart(overrides = {}) {
  const wrapper = mount(StatisticsChart, {
    props: { chartDef: definition, stats: {}, monthsLabels: [], visitsCounts: [], ...overrides },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

describe('chart configuration and lifecycle through actual components', () => {
  it('renders data without mutating caller arrays and destroys on unmount', async () => {
    const wrapper = await chart()
    expect(created).toHaveLength(1)
    expect(created[0].config.data.labels).toEqual(['A', 'B'])
    expect(created[0].config.data.labels).not.toBe(definition.labels)
    expect(created[0].config.data.datasets[0].data).not.toBe(definition.data)
    expect(created[0].config.options.scales.y.beginAtZero).toBe(true)
    const instance = created[0]
    wrapper.unmount()
    expect(instance.destroy).toHaveBeenCalledOnce()
  })

  it('empty data removes the canvas and a subsequent payload creates it', async () => {
    const wrapper = await chart({ chartDef: { ...definition, labels: [], data: [] } })
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(wrapper.text()).toContain('لا توجد بيانات')
    expect(created).toHaveLength(0)
    await wrapper.setProps({ chartDef: definition })
    await flushPromises()
    expect(created).toHaveLength(1)
    const instance = created[0]
    await wrapper.setProps({ chartDef: { ...definition, labels: [], data: [] } })
    await flushPromises()
    expect(instance.destroy).toHaveBeenCalledOnce()
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('in-place reactive data changes replace the previous instance', async () => {
    const stats = reactive({ labels: ['One'], counts: [1] })
    const wrapper = await chart({ stats, chartDef: {
      ...definition, labels: value => value.labels, data: value => value.counts,
    } })
    const previous = created.at(-1)
    stats.counts[0] = 4
    stats.labels.push('Two')
    stats.counts.push(5)
    await flushPromises()
    expect(previous.destroy).toHaveBeenCalledOnce()
    expect(created.at(-1).config.data.datasets[0].data).toEqual([4, 5])
    wrapper.unmount()
  })

  it.each(['rtl', 'ltr'])('uses %s tooltip and wide legend presentation', async direction => {
    vi.stubGlobal('innerWidth', 1280)
    const wrapper = await chart({ chartDef: { ...definition, type: 'doughnut' }, style: `direction:${direction}` })
    // Set the canvas direction explicitly; jsdom does not inherit computed direction.
    wrapper.get('canvas').element.style.direction = direction
    document.documentElement.setAttribute('dir', direction)
    await flushPromises()
    const plugins = created.at(-1).config.options.plugins
    expect(plugins.tooltip.textDirection).toBe(direction)
    expect(plugins.legend.position).toBe(direction === 'rtl' ? 'right' : 'left')
  })

  it('theme token changes rebuild colors and retain Arabic numeric tick labels', async () => {
    const wrapper = await chart()
    const previous = created.at(-1)
    document.body.style.setProperty('--chart-color-1', '#123456')
    document.body.classList.add('dark-mode')
    await flushPromises()
    expect(previous.destroy).toHaveBeenCalledOnce()
    const config = created.at(-1).config
    expect(config.options.scales.y.ticks.callback(12)).toBe('١٢')
    expect(getChartColors(1)).toEqual(['#123456'])
    wrapper.unmount()
  })

  it('crossing the compact breakpoint moves the legend and same-band resizing does not rebuild', async () => {
    vi.stubGlobal('innerWidth', 1280)
    await chart({ chartDef: { ...definition, type: 'doughnut' } })
    vi.stubGlobal('innerWidth', 390)
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    expect(created.at(-1).config.options.plugins.legend.position).toBe('bottom')
    const count = created.length
    vi.stubGlobal('innerWidth', 400)
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    expect(created).toHaveLength(count)
  })

  it('line charts preserve fill and stroke settings and disable legends when requested', async () => {
    await chart({ chartDef: { ...definition, type: 'line', options: { fill: true, legend: false } } })
    const config = created.at(-1).config
    expect(config.data.datasets[0]).toMatchObject({ fill: true, borderWidth: 2, tension: 0.3 })
    expect(config.options.plugins.legend.display).toBe(false)
  })

  it('mini charts rebuild on changed values and clean up when their labels empty', async () => {
    const wrapper = mount(MiniBarChart, { props: { labels: ['A'], values: [1] }, attachTo: document.body })
    await flushPromises()
    expect(created.at(-1).config.options.plugins.tooltip.enabled).toBe(false)
    const first = created.at(-1)
    await wrapper.setProps({ values: [7] })
    await flushPromises()
    expect(first.destroy).toHaveBeenCalledOnce()
    expect(created.at(-1).config.data.datasets[0].data).toEqual([7])
    const last = created.at(-1)
    await wrapper.setProps({ labels: [] })
    await flushPromises()
    expect(last.destroy).toHaveBeenCalledOnce()
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('palette cycles safely when there are more than twelve categories', () => {
    const colors = getChartColors(14)
    expect(colors).toHaveLength(14)
    expect(colors[0]).toBe(colors[12])
    expect(colors.every(Boolean)).toBe(true)
  })
})
