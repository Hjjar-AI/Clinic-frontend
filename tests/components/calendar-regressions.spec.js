import { it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import apiClient from '@/services/apiClient'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useCalendar } from '@/features/appointments/composables/useCalendar'
import { useVisitScales } from '@/features/visits/composables/useVisitScales'
import { useScaleLookup } from '@/stores/scaleLookup'
import DayViewGrid from '@/features/appointments/components/DayViewGrid.vue'
import CalendarView from '@/features/appointments/components/CalendarView.vue'
import CalendarLayout from '@/features/appointments/components/CalendarLayout.vue'

it('a busy calendar follows all offsets and keeps 450 appointments', async () => {
  useAuthStore().user = { id: 1 }; let calendar; const calls = []
  mount({ setup() { calendar = useCalendar(); return () => null } })
  apiClient.defaults.adapter = async config => {
    calls.push(config.params); const offset = config.params.offset
    return { config, headers: {}, status: 200, data: { data: { appointments: Array.from({ length: Math.min(200, 450 - offset) }, (_, index) => ({ id: offset + index })), meta: { total: 450 } } } }
  }
  expect(await calendar.fetchAppointments(new Date(2026, 9, 1), new Date(2026, 9, 31))).toBe(true)
  expect(calendar.appointments.value).toHaveLength(450); expect(calls.map(call => call.offset)).toEqual([0, 200, 400]); expect(calls.every(call => call.per_page === 200)).toBe(true)
})

it('calendar failure exposes retry state and discards a stale period', async () => {
  useAuthStore().user = { id: 1 }; let calendar, resolveOld
  mount({ setup() { calendar = useCalendar(); return () => null } })
  apiClient.defaults.adapter = config => new Promise(resolve => { resolveOld = data => resolve({ config, data, headers: {}, status: 200 }) })
  const old = calendar.fetchAppointments(new Date(2026, 9, 1), new Date(2026, 9, 1)); await flushPromises()
  apiClient.defaults.adapter = async config => ({ config, data: { data: { appointments: [{ id: 'new' }], meta: { total: 1 } } }, headers: {}, status: 200 })
  await calendar.fetchAppointments(new Date(2026, 9, 2), new Date(2026, 9, 2)); resolveOld({ data: { appointments: [{ id: 'old' }], meta: { total: 1 } } }); await old
  expect(calendar.appointments.value).toEqual([{ id: 'new' }]); expect(calendar.loading.value).toBe(false)
  apiClient.defaults.adapter = async config => { throw Object.assign(Error('Synthetic'), { config, response: { status: 500 } }) }
  expect(await calendar.fetchAppointments(new Date(), new Date())).toBe(false); expect(calendar.error.value).toBeTruthy()
})

it('day calendar renders simultaneous, off-grid and occupied interval bookings from API time fields', () => {
  const make = (id, time, doctor) => ({ id, appointment_date: '2026-10-12', appointment_time: time, duration_minutes: 45, patient_name: `Synthetic ${id}`, doctor_name: doctor, status: 'scheduled' })
  const wrapper = mount(DayViewGrid, { props: { currentDateStr: '2026-10-12', timeSlots: ['08:00', '08:30', '09:00'], appointments: [make(1, '08:15:00', 'One'), make(2, '08:15:00', 'Two'), make(3, '07:15:00', 'Early')], canManage: true }, global: { stubs: { AppointmentBlock: { props: ['appointment'], template: '<div data-booking>{{ appointment.patient_name }} {{ appointment.appointment_time }}</div>' } } } })
  expect(wrapper.text()).toContain('Synthetic 1'); expect(wrapper.text()).toContain('Synthetic 2'); expect(wrapper.text()).toContain('Synthetic 3')
  const occupied = wrapper.findAll('.day-slot').find(row => row.text().includes('08:30')); expect(occupied.findAll('[data-booking]')).toHaveLength(2); expect(occupied.text()).not.toContain('متاح')
})

it.each([CalendarView, CalendarLayout])('calendar wrapper forwards the complete rescheduling tuple', async component => {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { render: () => null } }] }); await router.push('/')
  const wrapper = mount(component, { props: { view: 'day', currentDateStr: '2026-10-12', currentDate: new Date(2026, 9, 12), timeSlots: [], appointments: [], canManage: true }, global: { plugins: [router], stubs: { DayViewGrid: true, CalendarView: component === CalendarLayout } } })
  const child = component === CalendarView ? wrapper.findComponent({ name: 'DayViewGrid' }) : wrapper.findComponent({ name: 'CalendarView' })
  child.vm.$emit('drop-slot', 7, '2026-10-13', '09:30'); await nextTick(); expect(wrapper.emitted('drop-slot')[0]).toEqual([7, '2026-10-13', '09:30'])
})

it('late scale definitions preserve old answers, later edits and removals', async () => {
  let scales; mount({ setup() { scales = useVisitScales(); return () => null } }); const lookup = useScaleLookup()
  scales.hydrateFromVisit({ scale_responses: [{ scale_id: 1, responses_json: '{"2":7}' }] }); expect(scales.toPayload()[0].responses['2']).toBe(7)
  lookup.items = [{ id: 1, fields: [{ id: 2, default: 0 }] }]; await nextTick(); expect(scales.addedScales.value[0].fields[0].value).toBe(7)
  scales.addedScales.value[0].fields[0].value = 9; lookup.items = [{ id: 1, fields: [{ id: 2, default: 3 }] }]; await nextTick(); expect(scales.toPayload()[0].responses['2']).toBe(9)
  scales.removeScale(0); lookup.items = [{ id: 1, fields: [{ id: 2 }] }]; await nextTick(); expect(scales.toPayload()).toEqual([])
})
