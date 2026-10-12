import { it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ApiSelect from '@/components/ui/ApiSelect.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import UserForm from '@/features/settings/views/UserForm.vue'
import TemplateForm from '@/features/clinical/views/TemplateForm.vue'
import InvoiceForm from '@/features/billing/views/InvoiceForm.vue'
import PatientForm from '@/features/patients/views/PatientForm.vue'
import AppointmentForm from '@/features/appointments/views/AppointmentForm.vue'
import VisitForm from '@/features/visits/views/VisitForm.vue'
import UserPermissions from '@/features/settings/views/UserPermissions.vue'
import apiClient from '@/services/apiClient'
import userService from '@/features/settings/services/userService'
import templateService from '@/features/clinical/services/templateService'
import invoiceService from '@/features/billing/services/invoiceService'
import { usePatientStore } from '@/features/patients/stores/patients'
import { useAppointmentStore } from '@/features/appointments/stores/appointments'
import { useVisitStore } from '@/features/visits/stores/visits'
import { useConstantsStore } from '@/stores/constants'

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
it('ApiSelect late cancellation cannot hide the newer request spinner or replace its rows', async () => {
  const old = deferred(), current = deferred(); let calls = 0
  apiClient.defaults.adapter = async config => ({ data: await (++calls === 1 ? old : current).promise, headers: {}, status: 200, config })
  const wrapper = mount(ApiSelect, { props: { url: '/auth/users/doctors/' } }); await flushPromises()
  await wrapper.setProps({ url: '/patients/' }); await flushPromises()
  old.resolve({ data: [{ id: 1, name: 'STALE' }] }); await flushPromises()
  expect(wrapper.get('select').element.disabled).toBe(true)
  current.resolve({ data: { patients: [{ id: 2, name: 'CURRENT' }] } }); await flushPromises()
  expect(wrapper.text()).toContain('CURRENT'); expect(wrapper.text()).not.toContain('STALE'); expect(wrapper.get('select').element.disabled).toBe(false)
})
it('ApiSelect shows durable retry rather than silently empty options', async () => {
  apiClient.defaults.adapter = async config => { throw Object.assign(Error('Synthetic failure'), { config, response: { status: 500 } }) }
  const wrapper = mount(ApiSelect, { props: { url: '/patients/' } }); await flushPromises(); expect(wrapper.get('[role=alert]').text()).toContain('تعذر')
  apiClient.defaults.adapter = async config => ({ config, data: { data: [{ id: 1, name: 'Retried' }] }, headers: {}, status: 200 })
  await wrapper.get('[role=alert] button').trigger('click'); await flushPromises(); expect(wrapper.text()).toContain('Retried'); expect(wrapper.find('[role=alert]').exists()).toBe(false)
})
it('MultiSelect ignores old inline searches after newer text and short-query invalidation', async () => {
  const old = deferred(), current = deferred()
  const wrapper = mount(MultiSelect, { props: { mode: 'inline', minLength: 2, searchFn: query => query === 'old' ? old.promise : current.promise, optionLabel: option => option.name, optionKey: option => option.id } })
  await wrapper.get('input').setValue('old'); await wrapper.get('input').setValue('new')
  current.resolve([{ id: 2, name: 'new current' }]); await flushPromises(); old.resolve([{ id: 1, name: 'old stale' }]); await flushPromises()
  expect(wrapper.text()).toContain('new current'); expect(wrapper.text()).not.toContain('old stale')
  await wrapper.get('input').setValue('x'); await flushPromises(); expect(wrapper.find('.spinner').exists()).toBe(false); expect(wrapper.text()).not.toContain('new current')
})
it('MultiSelect native trigger/removal controls are separate and duplicate marking never mutates input rows', async () => {
  const wrapper = mount(MultiSelect, { props: { options: [{ value: 0, label: 'Zero option' }], modelValue: [0] } })
  expect(wrapper.find('button button').exists()).toBe(false); expect(wrapper.text()).toContain('Zero option')
  const selected = Object.freeze({ id: 1, name: 'Synthetic selected', duplicate: false })
  const inline = mount(MultiSelect, { props: { mode: 'inline', modelValue: [selected], initialOptions: [{ id: 2, name: 'Synthetic next' }], optionKey: row => row.id, optionLabel: row => row.name } })
  await inline.get('input').trigger('focus'); await inline.get('.autocomplete-item').trigger('click')
  const emitted = inline.emitted('update:modelValue')[0][0]; expect(emitted).toHaveLength(2); expect(emitted[0]).not.toBe(selected); expect(selected.duplicate).toBe(false)
})

const edits = [
  ['user', UserForm, () => [userService, 'getById'], () => [userService, 'update']],
  ['template', TemplateForm, () => [templateService, 'getById'], () => [templateService, 'update']],
  ['invoice', InvoiceForm, () => [invoiceService, 'getById'], () => [invoiceService, 'update']],
  ['patient', PatientForm, () => [usePatientStore(), 'fetchPatient'], () => [usePatientStore(), 'updatePatient']],
  ['appointment', AppointmentForm, () => [useAppointmentStore(), 'fetchAppointment'], () => [useAppointmentStore(), 'updateAppointment']],
  ['visit', VisitForm, () => [useVisitStore(), 'fetchVisit'], () => [useVisitStore(), 'updateVisit']],
  ['user permissions', UserPermissions, () => [userService, 'getById'], () => [userService, 'updatePermissions']],
]
it.each(edits)('%s failed edit hydration cannot submit blank values', async (name, component, readOwner, writeOwner) => {
  vi.spyOn(useConstantsStore(), 'fetch').mockResolvedValue({})
  const [reader, read] = readOwner(), [writer, write] = writeOwner()
  vi.spyOn(reader, read).mockRejectedValue(Error('Synthetic opening load failure')); const mutation = vi.spyOn(writer, write).mockResolvedValue({})
  apiClient.defaults.adapter = async config => ({ config, data: { data: { items: [], meta: {} } }, headers: {}, status: 200 })
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/edit/:id', component }] }); await router.push('/edit/7')
  const wrapper = mount(component, { global: { plugins: [router] } }); await flushPromises()
  expect(wrapper.text()).toContain('تعذر تحميل')
  if (wrapper.find('form').exists()) { expect(wrapper.get('fieldset').element.disabled).toBe(true); await wrapper.get('form').trigger('submit'); await flushPromises() }
  expect(mutation).not.toHaveBeenCalled()
})
it('an edit response without its opening version remains unsaveable', async () => {
  vi.spyOn(userService, 'getById').mockResolvedValue({ id: 7, username: 'Synthetic' }); const update = vi.spyOn(userService, 'update')
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/users/:id/edit', component: UserForm }] }); await router.push('/users/7/edit')
  const wrapper = mount(UserForm, { global: { plugins: [router] } }); await flushPromises()
  expect(wrapper.get('fieldset').element.disabled).toBe(true); await wrapper.get('form').trigger('submit'); expect(update).not.toHaveBeenCalled()
})
