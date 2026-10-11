import { it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useVisitForm } from '@/features/visits/composables/useVisitForm'
import { useVisitStore } from '@/features/visits/stores/visits'

it('untouched risk controls serialize as unassessed, while an explicit negative remains explicit', async () => {
  const create = vi.spyOn(useVisitStore(), 'createVisit').mockResolvedValue({ id: 9 })
  let visit
  const component = defineComponent({ setup() {
    visit = useVisitForm({ getPatientId: () => 7, isEdit: false })
    return () => null
  } })
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/new', component },
    { path: '/patients/:id', name: 'PatientDetail', component: { template: '<p>Patient</p>' } },
  ] })
  await router.push('/new')
  mount({ template: '<RouterView />' }, { global: { plugins: [router] } })
  await flushPromises()
  visit.form.main_complaints = 'Synthetic complaint'
  visit.form.violence_risk_level = 'none'
  visit.form.firearm_access = false
  expect(await visit.handleSubmit()).toBe(true)
  expect(create).toHaveBeenCalledWith(7, expect.objectContaining({
    suicide_risk_level: '', violence_risk_level: 'none', firearm_access: false,
  }))
  await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('PatientDetail'))
})
