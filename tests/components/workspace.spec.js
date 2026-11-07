import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { reactive } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import WorkspacePreferences from '@/features/settings/components/WorkspacePreferences.vue'
import DataTable from '@/components/ui/DataTable.vue'
import FormActions from '@/components/ui/FormActions.vue'
import VisitSectionNavigator from '@/features/visits/components/VisitSectionNavigator.vue'
import InstructionAcknowledgement from '@/features/visits/components/InstructionAcknowledgement.vue'
import ApprovedVisitReference from '@/features/visits/components/ApprovedVisitReference.vue'
import PatientWorkspaceHeader from '@/features/visits/components/PatientWorkspaceHeader.vue'
import patientService from '@/features/patients/services/patientService'
import visitService from '@/features/visits/services/visitService'
import { changeSession } from '@/services/sessionState'

async function router() {
  const result = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', name: 'Home', component: { template: '<p>Home</p>' } }, { path: '/visits/:id', name: 'VisitDetail', component: { template: '<p>Visit</p>' } }] })
  await result.push('/')
  return result
}
describe('clinical workspace preferences and controls', () => {
  it('keeps optional layouts off by default, remembers only display preferences per account and excludes clinical values', async () => {
    const auth = useAuthStore()
    auth.user = { id: 1, permissions: ['view_visits', 'export_pdf'] }
    const workspace = useWorkspaceStore()
    expect(workspace.preferences).toEqual({ density: 'comfortable', splitView: false, progressive: false })
    workspace.update({ splitView: true, progressive: true, density: 'compact', patient: 'PRIVATE' })
    expect(localStorage.getItem('clinic:workspace:1')).not.toContain('PRIVATE')
    auth.user = { id: 2 }
    expect(workspace.preferences.splitView).toBe(false)
    auth.user = { id: 1, permissions: ['view_visits', 'export_pdf'] }
    expect(workspace.preferences.splitView).toBe(true)
    const wrapper = mount(WorkspacePreferences)
    await wrapper.get('select').setValue('comfortable')
    expect(workspace.preferences.density).toBe('comfortable')
  })

  it('retains the primary table column and remembers visibility without sorting partial rows locally', async () => {
    useAuthStore().user = { id: 7 }
    const props = { preferenceKey: 'Visits', columns: [{ key: 'patient', label: 'المريض' }, { key: 'date', label: 'التاريخ', sortKey: 'date' }], items: [{ id: 1, patient: 'Synthetic', date: '2026-10-13' }] }
    const wrapper = mount(DataTable, { props })
    expect(wrapper.findAll('input')[0].element.disabled).toBe(true)
    await wrapper.findAll('input')[1].setValue(false)
    expect(wrapper.findAll('th')).toHaveLength(1)
    const second = mount(DataTable, { props })
    expect(second.findAll('th')).toHaveLength(1)
    await second.findAll('button').find(button => button.text() === 'استعادة الأعمدة').trigger('click')
    await second.findAll('button').find(button => button.text() === 'التاريخ').trigger('click')
    expect(second.emitted('sort')).toEqual([['date']])
    await second.setProps({ sortBy: 'date', sortOrder: 'asc' })
    expect(second.findAll('th')[1].attributes('aria-sort')).toBe('ascending')
  })

  it('opens the target section and moves keyboard focus while exposing unrecorded fields as hints', async () => {
    const target = document.createElement('section')
    target.id = 'visit-examination'; target.tabIndex = -1
    const toggle = document.createElement('button'); toggle.setAttribute('aria-expanded', 'false')
    toggle.onclick = () => toggle.setAttribute('aria-expanded', 'true')
    target.append(toggle); document.body.append(target)
    target.scrollIntoView = vi.fn()
    const wrapper = mount(VisitSectionNavigator, { props: { form: { main_complaints: 'Synthetic', mse: '', medications: [] } } })
    await wrapper.findAll('button').find(button => button.text().includes('الفحص')).trigger('click')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(target)
    expect(target.scrollIntoView).toHaveBeenCalledOnce()
  })

  it('records explicit instruction acknowledgement with unknown/false distinction and leaves it optional', async () => {
    const form = reactive({ clinical_data: {} })
    const wrapper = mount(InstructionAcknowledgement, { props: { form } })
    await wrapper.get('input[type=checkbox]').setValue(true)
    expect(form.clinical_data.instruction_acknowledgement.recipient).toBe('patient')
    expect(form.clinical_data.instruction_acknowledgement.clarification_needed).toBeNull()
    expect(form.clinical_data.instruction_acknowledgement.explained_at).toMatch(/Z$/)
    await wrapper.findAll('select')[1].setValue('false')
    expect(form.clinical_data.instruction_acknowledgement.clarification_needed).toBe(false)
    await wrapper.get('input[type=checkbox]').setValue(false)
    expect(form.clinical_data.instruction_acknowledgement).toBeNull()
  })

  it('shows saving, failure, unsaved and saved feedback beside the same primary action', async () => {
    const wrapper = mount(FormActions, { props: { dirty: true }, global: { plugins: [await router()] } })
    expect(wrapper.get('[role=status]').text()).toContain('غير محفوظة')
    await wrapper.setProps({ submitting: true })
    expect(wrapper.get('[role=status]').text()).toContain('جاري')
    await wrapper.setProps({ submitting: false, error: 'Synthetic failure' })
    expect(wrapper.get('[role=status]').text()).toContain('تعذر الحفظ')
    await wrapper.setProps({ error: '', dirty: false, saved: true })
    expect(wrapper.get('[role=status]').text()).toBe('تم الحفظ')
  })

  it('ignores late approved-reference data after session changes', async () => {
    let resolve
    vi.spyOn(visitService, 'approvedReference').mockImplementation(() => new Promise(finish => { resolve = finish }))
    const wrapper = mount(ApprovedVisitReference, { props: { patientId: 1 }, global: { plugins: [await router()] } })
    changeSession(null)
    resolve({ visit_id: 9, fields: { main_complaints: 'OLD-PRIVATE' }, medications: [] })
    await flushPromises()
    expect(wrapper.text()).not.toContain('OLD-PRIVATE')
  })

  it('finds active allergies beyond retired rows without changing an explicit recorded summary', async () => {
    useAuthStore().user = { id: 1, permissions: ['view_visits', 'export_pdf'] }
    const records = vi.spyOn(patientService, 'getRecords').mockResolvedValueOnce({ total: 101, items: Array.from({ length: 100 }, () => ({ is_active: false, substance: 'Retired' })) })
      .mockResolvedValueOnce({ total: 101, items: [{ is_active: true, substance: 'ACTIVE-SYNTHETIC-ALLERGY' }] })
    const wrapper = mount(PatientWorkspaceHeader, { props: { patient: { id: 1, name: 'Synthetic patient', allergy_status: 'recorded' }, summaryOnly: true }, global: { plugins: [await router()] } })
    await flushPromises()
    expect(records).toHaveBeenLastCalledWith(1, 'allergies', 100)
    expect(wrapper.text()).toContain('ACTIVE-SYNTHETIC-ALLERGY')
    expect(wrapper.text()).not.toContain('Retired')
    expect(wrapper.text()).toContain('حساسيات مسجلة')
    changeSession(null)
    await flushPromises()
    expect(wrapper.text()).not.toContain('ACTIVE-SYNTHETIC-ALLERGY')
  })
})
