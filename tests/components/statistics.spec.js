import { it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Statistics from '@/features/reports/views/Statistics.vue'
import statisticsService from '@/features/reports/services/statisticsService'

it('statistics cards unwrap computed counts and names into Arabic display values', async () => {
  vi.spyOn(statisticsService, 'getStatistics').mockResolvedValue({ top_medication: ['دواء اصطناعي', 3], top_diagnosis: ['تشخيص اصطناعي', 2] })
  const wrapper = mount(Statistics, { global: { stubs: { StatisticsLayout: true } } })
  await flushPromises()
  const cards = wrapper.getComponent({ name: 'StatisticsLayout' }).props('secondKpiItems')
  expect(cards[2].value).toBe('٣')
  expect(cards[2].subtitle).toBe('دواء اصطناعي')
  expect(cards[3].value).toBe('٢')
  expect(cards[3].subtitle).toBe('تشخيص اصطناعي')
})
