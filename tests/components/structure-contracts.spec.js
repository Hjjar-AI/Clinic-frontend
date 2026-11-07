import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { expect, it, vi } from 'vitest'

import { useLatestResource } from '@/composables/useLatestResource'
import ScalePickerModal from '@/features/clinical/components/ScalePickerModal.vue'
import scaleService from '@/features/clinical/services/scaleService'
import { changeSession } from '@/services/sessionState'

it('scale picker exposes failed catalog reads, follows cursors on retry and selects an actual catalog record', async () => {
  const first = { id: 701, name: 'Synthetic first scale', fields: [] }
  const second = { id: 702, name: 'Synthetic second scale', fields: [] }
  const read = vi.spyOn(scaleService, 'getAll')
    .mockRejectedValueOnce(new Error('Synthetic catalog failure'))
    .mockResolvedValueOnce({ scales: [first], meta: { next_cursor: 'second' } })
    .mockResolvedValueOnce({ scales: [second], meta: {} })
  const wrapper = mount(ScalePickerModal, { props: { modelValue: true }, attachTo: document.body })
  await flushPromises()
  expect(document.querySelector('[role=alert]').textContent).toContain('تعذر تحميل المقاييس')
  document.querySelector('[role=alert] button').click()
  await flushPromises()
  expect(read).toHaveBeenLastCalledWith({ per_page: 200, cursor: 'second' })
  const option = [...document.querySelectorAll('[role=dialog] button')].find(button => button.textContent.includes(second.name))
  expect(option).toBeDefined()
  option.click()
  expect(wrapper.emitted('select')).toEqual([[second]])
})

it('latest resource retains explicit read error/retry ownership and accepts a successful retry', async () => {
  const read = vi.fn().mockRejectedValueOnce(new Error('Synthetic failure')).mockResolvedValueOnce({ id: 1 })
  let resource
  mount(defineComponent({ setup() {
    resource = useLatestResource(() => 'synthetic-resource', read, 'Synthetic load error')
    return () => null
  } }))
  await flushPromises()
  expect(resource.loading.value).toBe(false)
  expect(resource.error.value).toBe('Synthetic load error')
  await resource.retry()
  expect(resource.error.value).toBe('')
  expect(resource.data.value).toEqual({ id: 1 })
})

it('latest resource discards replaced, previous-session and unmounted read results', async () => {
  const key = ref('first'), pending = new Map()
  let resource
  const wrapper = mount(defineComponent({ setup() {
    resource = useLatestResource(key, value => new Promise(resolve => pending.set(value, resolve)))
    return () => null
  } }))
  key.value = 'second'
  await flushPromises()
  pending.get('second')({ id: 2 })
  await flushPromises()
  pending.get('first')({ id: 1 })
  await flushPromises()
  expect(resource.data.value).toEqual({ id: 2 })
  key.value = 'third'
  await flushPromises()
  changeSession(null)
  pending.get('third')({ id: 3 })
  await flushPromises()
  expect(resource.data.value).toBeNull()
  key.value = 'fourth'
  await flushPromises()
  wrapper.unmount()
  pending.get('fourth')({ id: 4 })
  await flushPromises()
  expect(resource.data.value).toBeNull()
})
