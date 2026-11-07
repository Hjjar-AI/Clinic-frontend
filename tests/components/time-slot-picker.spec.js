import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import apiClient from '@/services/apiClient'
import TimeSlotPicker from '@/features/appointments/components/TimeSlotPicker.vue'

const props = { doctorId: 3, date: '2026-10-20', duration: 30 }
const slots = [{ time: '10:00', available: false }, { time: '10:30', available: true }]
const reply = (config, rows = slots) => ({ data: { data: { slots: rows } }, status: 200, headers: {}, config })

describe('actual scheduling availability control', () => {
  it('requests the selected doctor, normalized date and duration and disables occupied options', async () => {
    let request
    apiClient.defaults.adapter = async config => { request = config; return reply(config) }
    const wrapper = mount(TimeSlotPicker, { props: { ...props, date: '20/10/2026', duration: 45 } })
    await flushPromises()
    expect(request.url).toBe('/appointments/availability/')
    expect(request.params).toEqual({ doctor_id: 3, date: '2026-10-20', duration: 45 })
    expect(wrapper.get('option[value="10:00"]').element.disabled).toBe(true)
    expect(wrapper.get('option[value="10:30"]').element.disabled).toBe(false)
    await wrapper.get('select').setValue('10:30')
    expect(wrapper.emitted('update:modelValue')).toEqual([['10:30']])
  })

  it.each([slots, []])('preserves an existing appointment time even when unavailable or absent', async rows => {
    apiClient.defaults.adapter = async config => reply(config, rows)
    const wrapper = mount(TimeSlotPicker, { props: { ...props, modelValue: '10:00', currentValue: '10:00' } })
    await flushPromises()
    expect(wrapper.get('option[value="10:00"]').element.disabled).toBe(false)
    expect(wrapper.text()).toContain('الموعد الحالي')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('clears a newly selected time that has become occupied', async () => {
    apiClient.defaults.adapter = async config => reply(config)
    const wrapper = mount(TimeSlotPicker, { props: { ...props, modelValue: '10:00' } })
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })

  it('disables while loading and drops a cancelled response after a newer context resolves', async () => {
    const pending = []
    apiClient.defaults.adapter = config => new Promise(resolve => pending.push({ config, resolve }))
    const wrapper = mount(TimeSlotPicker, { props })
    await flushPromises()
    expect(wrapper.get('select').element.disabled).toBe(true)
    await wrapper.setProps({ doctorId: 4 })
    await flushPromises()
    expect(pending[0].config.cancelToken.reason).toBeDefined()
    pending[1].resolve(reply(pending[1].config, [{ time: '12:00', available: true }]))
    await flushPromises()
    pending[0].resolve(reply(pending[0].config))
    await flushPromises()
    expect(wrapper.get('select').element.disabled).toBe(false)
    expect(wrapper.find('option[value="12:00"]').exists()).toBe(true)
    expect(wrapper.find('option[value="10:30"]').exists()).toBe(false)
  })

  it('clearing scheduling context cancels pending work and removes old options', async () => {
    let pending
    apiClient.defaults.adapter = config => new Promise(resolve => { pending = { config, resolve } })
    const wrapper = mount(TimeSlotPicker, { props })
    await flushPromises()
    await wrapper.setProps({ date: '', modelValue: '10:30' })
    expect(pending.config.cancelToken.reason).toBeDefined()
    pending.resolve(reply(pending.config))
    await flushPromises()
    expect(wrapper.find('option[value="10:30"]').exists()).toBe(false)
    expect(wrapper.get('select').element.disabled).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })

  it('unmount cancels the in-flight availability request', async () => {
    let request, resolve
    apiClient.defaults.adapter = config => { request = config; return new Promise(done => { resolve = done }) }
    const wrapper = mount(TimeSlotPicker, { props })
    await flushPromises()
    wrapper.unmount()
    expect(request.cancelToken.reason).toBeDefined()
    resolve(reply(request))
    await flushPromises()
  })

  it('failed refresh removes obsolete options and restores enabled state', async () => {
    apiClient.defaults.adapter = async config => reply(config)
    const wrapper = mount(TimeSlotPicker, { props })
    await flushPromises()
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    apiClient.defaults.adapter = async () => { throw new Error('Synthetic failure') }
    await wrapper.setProps({ duration: 45 })
    await flushPromises()
    expect(wrapper.find('option[value="10:30"]').exists()).toBe(false)
    expect(wrapper.get('select').element.disabled).toBe(false)
    expect(wrapper.text()).toContain('لا توجد مواعيد متاحة')
    expect(log).toHaveBeenCalledOnce()
  })
})
