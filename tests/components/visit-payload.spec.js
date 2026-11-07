import { it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createVisitDefaults, hydrateVisit, duplicateVisit } from '@/features/visits/model/visitForm'
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


it('removing the last goal sends an empty list and omits server signing metadata', async () => {
  const update = vi.spyOn(useVisitStore(), 'updateVisit').mockResolvedValue({})
  let visit
  const component = defineComponent({ setup() {
    visit = useVisitForm({ getPatientId: () => 7, visitId: 9, isEdit: true })
    return () => null
  } })
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/edit', component },
    { path: '/patients/:id', name: 'PatientDetail', component: { template: '<p>Patient</p>' } },
  ] })
  await router.push('/edit')
  mount({ template: '<RouterView />' }, { global: { plugins: [router] } })
  await flushPromises()
  visit.hydrateFromData({ id: 9, version: 5, visit_date: '2026-10-12',
    main_complaints: 'Synthetic complaint', signed_by_id: 1, date_signed: '2026-10-12',
    clinical_data: { goals: [{ title: 'Synthetic old goal', percentage: 20 }] },
  })
  visit.form.goals.splice(0)
  expect(await visit.handleSubmit()).toBe(true)
  const payload = update.mock.calls[0][1]
  expect(payload.clinical_data.goals).toEqual([])
  expect(payload.version).toBe(5)
  expect(payload).not.toHaveProperty('signed_by_id')
  expect(payload).not.toHaveProperty('date_signed')
})


it('fresh and hydrated visit forms own their nested records across patients and duplication', () => {
  const first = createVisitDefaults('07/11/2026')
  first.goals.push({ title: 'Synthetic first goal', percentage: 0 })
  first.clinical_data.private_note = 'Synthetic first note'
  const second = createVisitDefaults('07/11/2026')
  expect(second.goals).toEqual([])
  expect(second.clinical_data).toEqual({})
  const source = { visit_date: '2026-11-07', clinical_data: { goals: [{ title: 'Synthetic saved goal', percentage: null }] }, lab_values: [{ name: 'Synthetic lab', value: '0' }] }
  const edit = hydrateVisit(source), duplicate = duplicateVisit(source, '08/11/2026')
  edit.goals[0].title = 'Synthetic changed goal'
  edit.lab_values[0].value = '1'
  expect(source.clinical_data.goals[0].title).toBe('Synthetic saved goal')
  expect(source.lab_values[0].value).toBe('0')
  expect(duplicate.goals).toEqual([])
  expect(duplicate.lab_values[0].value).toBe('0')
  expect(duplicate.visit_date).toBe('08/11/2026')
})
