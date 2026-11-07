import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import apiClient from '@/services/apiClient'
import { clearAllFormDrafts } from '@/composables/useFormDraft'
import { useAppointmentStore } from '@/features/appointments/stores/appointments'
import AppointmentForm from '@/features/appointments/views/AppointmentForm.vue'

// Availability rendering has its own API/service coverage. This child double
// lets these tests exercise the actual form's version/context/lifecycle logic.
const slots = {
  props: ['modelValue', 'currentValue'], emits: ['update:modelValue'],
  template: '<input aria-label="Synthetic available time" :value="modelValue" :data-current="currentValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}
async function form(status = 'scheduled') {
  clearAllFormDrafts()
  apiClient.defaults.adapter = async config => ({ data: { data: [{ id: 3, full_name: 'Synthetic doctor' }] }, status: 200, headers: {}, config })
  const store = useAppointmentStore()
  vi.spyOn(store, 'fetchAppointment').mockResolvedValue({
    id: 11, version: 5, patient: 7, patient_name: 'Synthetic patient', doctor: 3,
    appointment_date: '2026-10-20', appointment_time: '10:00:00', duration_minutes: 30, status, notes: '', status_reason: '',
  })
  const update = vi.spyOn(store, 'updateAppointment').mockResolvedValue({})
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/appointments/:id/edit', name: 'AppointmentEdit', component: AppointmentForm },
    { path: '/appointments', name: 'AppointmentsCalendar', component: { template: '<p>Calendar</p>' } },
  ] })
  await router.push('/appointments/11/edit')
  const wrapper = mount({ template: '<RouterView />' }, { global: { plugins: [router], stubs: { TimeSlotPicker: slots } } })
  await flushPromises()
  return { wrapper, update, router }
}

describe('appointment form lifecycle and opening context', () => {
  it('retains the current time only while its scheduling context is unchanged', async () => {
    const { wrapper } = await form()
    const time = wrapper.get('input[aria-label="Synthetic available time"]')
    expect(time.attributes('data-current')).toBe('10:00')
    await wrapper.get('input[type=range]').setValue('45')
    expect(time.attributes('data-current')).toBe('')
    await wrapper.get('input[type=range]').setValue('30')
    expect(time.attributes('data-current')).toBe('10:00')
  })

  it('a completed appointment offers no invalid backwards lifecycle transitions', async () => {
    const { wrapper } = await form('completed')
    const status = wrapper.findAll('select').find(node => node.find('option[value=completed]').exists())
    expect(status.findAll('option').map(node => node.attributes('value'))).toEqual(['completed'])
  })

  it('cancellation requires a reason before calling the update endpoint', async () => {
    const { wrapper, update } = await form()
    const status = wrapper.findAll('select').find(node => node.find('option[value=cancelled]').exists())
    await status.setValue('cancelled')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(update).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('السبب مطلوب')
    const reason = wrapper.findAll('textarea')[0]
    await reason.setValue('Synthetic cancellation')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('11', expect.objectContaining({ status: 'cancelled', status_reason: 'Synthetic cancellation', version: 5 })))
    await flushPromises()
  })

  it('successful edit sends normalized date and opening version and clears the dirty route guard', async () => {
    const { wrapper, update, router } = await form()
    await wrapper.get('textarea').setValue('Synthetic changed notes')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('11', expect.objectContaining({
      patient_id: 7, doctor_id: 3, version: 5, appointment_date: '2026-10-20', appointment_time: '10:00', duration_minutes: 30,
    })))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('AppointmentsCalendar'))
    expect(document.querySelector('[role=dialog]')).toBeNull()
  })

  it('rejected edit stays on the form and retains the notes and time', async () => {
    const { wrapper, update, router } = await form()
    update.mockRejectedValue({ response: { status: 409, data: { error: { message: 'Synthetic scheduling conflict' } } } })
    await wrapper.get('textarea').setValue('Keep my notes')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Synthetic scheduling conflict'))
    expect(router.currentRoute.value.name).toBe('AppointmentEdit')
    expect(wrapper.get('textarea').element.value).toBe('Keep my notes')
    expect(wrapper.get('input[aria-label="Synthetic available time"]').element.value).toBe('10:00')
  })
})
