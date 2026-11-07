import { it, expect } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'

async function range(start = '', end = '') {
  const wrapper = mount({ components: { DateRangePicker }, setup() {
    return { start: ref(start), end: ref(end) }
  }, template: '<DateRangePicker v-model:start-date="start" v-model:end-date="end" />' }, { attachTo: document.body })
  await flushPromises()
  await flushPromises()
  return wrapper
}

it('controlled ISO dates retain day/month/year display and survive real flatpickr blur', async () => {
  const wrapper = await range()
  const inputs = wrapper.findAll('input')
  await inputs[0].setValue('01/01/2100')
  expect(wrapper.vm.start).toBe('2100-01-01')
  expect(inputs[0].element.value).toBe('01/01/2100')
  await inputs[0].trigger('blur')
  await flushPromises()
  expect(wrapper.vm.start).toBe('2100-01-01')
  await inputs[1].setValue('31/12/2100')
  await inputs[1].trigger('blur')
  await flushPromises()
  expect(wrapper.vm.end).toBe('2100-12-31')
  expect(inputs[1].element.value).toBe('31/12/2100')
  inputs[0].element._flatpickr.open()
  inputs[1].element._flatpickr.open()
  expect(document.querySelectorAll('.flatpickr-calendar.open')).toHaveLength(2)
  await inputs[1].trigger('keydown', { key: 'Escape' })
  expect(document.querySelectorAll('.flatpickr-calendar.open')).toHaveLength(0)
  expect(wrapper.vm.end).toBe('2100-12-31')
})

it('opening dates display correctly, reversed ranges disable apply and clear resets both models', async () => {
  const wrapper = await range('2026-10-11', '2026-10-01')
  expect(wrapper.findAll('input').map(input => input.element.value)).toEqual(['11/10/2026', '01/10/2026'])
  const apply = wrapper.findAll('button').find(button => button.text().includes('تطبيق'))
  expect(apply.element.disabled).toBe(true)
  await wrapper.findAll('button').find(button => button.text().includes('مسح')).trigger('click')
  expect(wrapper.vm.start).toBe('')
  expect(wrapper.vm.end).toBe('')
  expect(wrapper.findAll('input').map(input => input.element.value)).toEqual(['', ''])
  expect(apply.element.disabled).toBe(false)
})
