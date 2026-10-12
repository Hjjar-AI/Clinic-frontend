import { it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PatientCareTeamTab from '@/features/patients/components/PatientCareTeamTab.vue'
import patientService from '@/features/patients/services/patientService'
import { useAuthStore } from '@/features/auth/stores/auth'

function render() {
  useAuthStore().user = { id: 1, role: 'admin', permissions: ['manage_users'] }
  return mount(PatientCareTeamTab, { props: { patientId: 7, version: 3, members: [] } })
}

it('handles a canceled candidate lookup without escalating to the page boundary', async () => {
  const failure = Object.assign(new Error('Navigation cancelled'), { code: 'ERR_CANCELED' })
  vi.spyOn(patientService, 'getTeamCandidates').mockRejectedValue(failure)
  const wrapper = render()
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  expect(wrapper.get('select[aria-label="عضو فريق الرعاية"]').element.disabled).toBe(true)
  expect(wrapper.find('button').element.disabled).toBe(false)
})

it('retries a failed lookup and enables only a successfully loaded candidate', async () => {
  const lookup = vi.spyOn(patientService, 'getTeamCandidates').mockRejectedValueOnce(new Error('Synthetic failure'))
    .mockResolvedValueOnce([{ id: 11, full_name: 'Synthetic clinician' }])
  const wrapper = render()
  await flushPromises()
  await wrapper.get('[role="alert"] button').trigger('click')
  await flushPromises()
  expect(lookup).toHaveBeenCalledTimes(2)
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  const select = wrapper.get('select[aria-label="عضو فريق الرعاية"]')
  expect(select.element.disabled).toBe(false)
  await select.setValue(11)
  const add = vi.spyOn(patientService, 'addCareTeamMember').mockResolvedValue({})
  await wrapper.get('.care-team-add-row button').trigger('click')
  await flushPromises()
  expect(add).toHaveBeenCalledWith(7, 11, 'doctor', 3)
  expect(wrapper.emitted('added')).toHaveLength(1)
})

it('ignores a lookup completion after unmount', async () => {
  let resolve
  vi.spyOn(patientService, 'getTeamCandidates').mockImplementation(() => new Promise(done => { resolve = done }))
  const wrapper = render()
  expect(wrapper.get('select[aria-label="عضو فريق الرعاية"]').element.disabled).toBe(true)
  wrapper.unmount()
  resolve([{ id: 11, full_name: 'Synthetic clinician' }])
  await flushPromises()
  expect(wrapper.emitted('added')).toBeUndefined()
})
