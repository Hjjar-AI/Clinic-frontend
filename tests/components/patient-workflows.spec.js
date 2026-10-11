import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
import patientService from '@/features/patients/services/patientService'
import PatientRecordsPanel from '@/features/patients/components/PatientRecordsPanel.vue'
import PatientCareTeamTab from '@/features/patients/components/PatientCareTeamTab.vue'
import PatientDocumentsPanel from '@/features/patients/components/PatientDocumentsPanel.vue'
import PatientDuplicatePanel from '@/features/patients/components/PatientDuplicatePanel.vue'

const patient = () => ({ id: 7, version: 4, is_active: true, first_name: 'Synthetic', surname: 'Patient' })
function auth(role = 'admin', permissions = []) {
  useAuthStore().user = { id: 1, role, permissions }
}
function button(wrapper, text) {
  return wrapper.findAll('button').find(node => node.text().trim() === text)
}
async function records(kind = 'contacts', props = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: {} }] })
  await router.push({ path: '/', query: { kind } })
  const wrapper = mount(PatientRecordsPanel, { props: { patient: patient(), ...props }, global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}
function documentRow(changes = {}) {
  return { id: 11, version: 2, original_filename: 'synthetic.pdf', verification: 'reported', source: 'Synthetic lab', ...changes }
}

describe('longitudinal patient forms', () => {
  it('empty records explicitly retain unknown clinical meaning', async () => {
    auth()
    vi.spyOn(patientService, 'getRecords').mockResolvedValue({ items: [], total: 0, version: 4 })
    const wrapper = await records('allergies')
    expect(wrapper.text()).toContain('لا يعني ذلك تأكيد عدم وجود معلومات')
    expect(wrapper.emitted('changed')[0]).toEqual([4])
  })

  it('saves using the opening parent version despite a newer parent prop', async () => {
    auth()
    vi.spyOn(patientService, 'getRecords').mockResolvedValue({ items: [], total: 0, version: 4 })
    const save = vi.spyOn(patientService, 'saveRecord').mockResolvedValue({ version: 5 })
    const wrapper = await records()
    await button(wrapper, 'إضافة سجل').trigger('click')
    await wrapper.get('form input[type=text]').setValue('Synthetic contact')
    await wrapper.setProps({ patient: { ...patient(), version: 9 } })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(save).toHaveBeenCalledWith(7, expect.objectContaining({ kind: 'contacts', version: 4, fields: expect.objectContaining({ name: 'Synthetic contact' }) }))
    expect(wrapper.emitted('changed')).toContainEqual([5, true])
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('stale save preserves the draft and displays recovery instructions', async () => {
    auth()
    vi.spyOn(patientService, 'getRecords').mockResolvedValue({ items: [], total: 0, version: 4 })
    vi.spyOn(patientService, 'saveRecord').mockRejectedValue(new Error('409 synthetic conflict'))
    const wrapper = await records()
    await button(wrapper, 'إضافة سجل').trigger('click')
    await wrapper.get('form input[type=text]').setValue('Keep this draft')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('form input[type=text]').element.value).toBe('Keep this draft')
    expect(wrapper.text()).toContain('ألغ التعديل وأعد تحميل السجلات')
  })

  it('retirement sends an empty field set, record id and explicit reason', async () => {
    auth()
    vi.spyOn(patientService, 'getRecords').mockResolvedValue({ items: [{ id: 12, name: 'Synthetic', is_active: true }], total: 1, version: 4 })
    const save = vi.spyOn(patientService, 'saveRecord').mockResolvedValue({ version: 5 })
    const wrapper = await records()
    await button(wrapper, 'إنهاء السجل').trigger('click')
    expect(wrapper.findAll('form input')).toHaveLength(1)
    expect(wrapper.get('form input').attributes('required')).toBeDefined()
    await wrapper.get('form input').setValue('No longer current')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(save).toHaveBeenCalledWith(7, { kind: 'contacts', fields: {}, record_id: 12, operation: 'retire', reason: 'No longer current', version: 4 })
  })

  it('read-only roles cannot choose clinical kinds or edit records', async () => {
    auth('receptionist', ['view_patients'])
    vi.spyOn(patientService, 'getRecords').mockResolvedValue({ items: [], total: 0, version: 4 })
    const wrapper = await records('allergies')
    expect(wrapper.get('select').element.value).toBe('identifiers')
    expect(wrapper.get('select').findAll('option').map(row => row.attributes('value'))).toEqual(['identifiers', 'contacts', 'representatives'])
    expect(button(wrapper, 'إضافة سجل')).toBeUndefined()
  })

  it('archived patients and legacy visit followups have no edit actions', async () => {
    auth()
    vi.spyOn(patientService, 'getRecords').mockResolvedValue({ items: [{ id: 12, title: 'Synthetic', is_active: true, legacy_visit_follow_up: true }], total: 1, version: 4 })
    const wrapper = await records('follow-ups', { patient: { ...patient(), is_active: false } })
    expect(button(wrapper, 'إضافة سجل')).toBeUndefined()
    expect(button(wrapper, 'تعديل')).toBeUndefined()
    expect(wrapper.text()).toContain('تعديل تاريخها ونتيجتها من شاشة الزيارة')
  })

  it('switching kinds discards late results from the previous kind', async () => {
    auth()
    let resolveOld
    vi.spyOn(patientService, 'getRecords').mockImplementation((id, kind) => kind === 'contacts'
      ? new Promise(resolve => { resolveOld = resolve })
      : Promise.resolve({ items: [{ id: 13, value: 'CURRENT', is_active: true }], total: 1, version: 8 }))
    const wrapper = await records()
    await wrapper.get('select').setValue('identifiers')
    await flushPromises()
    resolveOld({ items: [{ id: 14, name: 'STALE' }], total: 1, version: 4 })
    await flushPromises()
    expect(wrapper.text()).toContain('CURRENT')
    expect(wrapper.text()).not.toContain('STALE')
    expect(wrapper.emitted('changed')).toEqual([[8]])
  })

  it('pagination appends older records using the current offset', async () => {
    auth()
    const get = vi.spyOn(patientService, 'getRecords')
      .mockResolvedValueOnce({ items: [{ id: 1, name: 'First' }], total: 2, version: 4 })
      .mockResolvedValueOnce({ items: [{ id: 2, name: 'Older' }], total: 2, version: 4 })
    const wrapper = await records()
    await button(wrapper, 'عرض المزيد').trigger('click')
    await flushPromises()
    expect(get).toHaveBeenLastCalledWith(7, 'contacts', 1)
    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).toContain('Older')
    expect(button(wrapper, 'عرض المزيد')).toBeUndefined()
  })
})

describe('care team controls', () => {
  it('add sends numeric candidate id, selected role and parent version', async () => {
    auth()
    vi.spyOn(patientService, 'getTeamCandidates').mockResolvedValue([{ id: 3, full_name: 'Synthetic doctor' }])
    const add = vi.spyOn(patientService, 'addCareTeamMember').mockResolvedValue({})
    const wrapper = mount(PatientCareTeamTab, { props: { patientId: 7, version: 4 } })
    await flushPromises()
    await wrapper.get('select[aria-label="عضو فريق الرعاية"]').setValue('3')
    await wrapper.get('select[aria-label="دور عضو فريق الرعاية"]').setValue('coordinator')
    await button(wrapper, 'إضافة').trigger('click')
    await flushPromises()
    expect(add).toHaveBeenCalledWith(7, 3, 'coordinator', 4)
    expect(wrapper.emitted('added')).toHaveLength(1)
    expect(wrapper.get('select[aria-label="عضو فريق الرعاية"]').element.selectedIndex).toBe(0)
    expect(button(wrapper, 'إضافة').attributes('disabled')).toBeDefined()
  })

  it('former members retain their history and only current members can be removed', async () => {
    auth()
    vi.spyOn(patientService, 'getTeamCandidates').mockResolvedValue([])
    const wrapper = mount(PatientCareTeamTab, { props: { patientId: 7, version: 4, members: [
      { id: 1, user: 3, user_name: 'Current', role: 'doctor' },
      { id: 2, user: 4, user_name: 'Former', ended_at: '2026-10-10', removal_reason: 'Reassigned', role: 'doctor' },
    ] } })
    await flushPromises()
    const remove = wrapper.findAll('button[aria-label="إزالة العضو من فريق الرعاية"]')
    expect(remove).toHaveLength(1)
    await remove[0].trigger('click')
    expect(wrapper.emitted('remove')[0]).toEqual([3])
    expect(wrapper.text()).toContain('Reassigned')
  })

  it('doctor without user-management permission has no mutation controls or lookup', async () => {
    auth('doctor', ['view_patients'])
    const candidates = vi.spyOn(patientService, 'getTeamCandidates')
    const wrapper = mount(PatientCareTeamTab, { props: { patientId: 7, version: 4 } })
    await flushPromises()
    expect(wrapper.find('select').exists()).toBe(false)
    expect(candidates).not.toHaveBeenCalled()
  })
})

describe('document metadata and archive', () => {
  it('metadata save uses the opening document version independently of patient version', async () => {
    auth()
    vi.spyOn(patientService, 'getDocuments').mockResolvedValue([documentRow()])
    const update = vi.spyOn(patientService, 'updateDocument').mockResolvedValue({})
    const wrapper = mount(PatientDocumentsPanel, { props: { patient: patient() } })
    await flushPromises()
    await button(wrapper, 'تعديل البيانات').trigger('click')
    await wrapper.setProps({ patient: { ...patient(), version: 50 } })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(update).toHaveBeenCalledWith(7, 11, expect.objectContaining({ version: 2, source: 'Synthetic lab', document_date: null }))
  })

  it('rejected metadata save keeps the selected document available for correction', async () => {
    auth()
    vi.spyOn(patientService, 'getDocuments').mockResolvedValue([documentRow()])
    vi.spyOn(patientService, 'updateDocument').mockRejectedValue(new Error('409'))
    const wrapper = mount(PatientDocumentsPanel, { props: { patient: patient() } })
    await flushPromises()
    await button(wrapper, 'تعديل البيانات').trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('تعارض الإصدار')
    expect(wrapper.get('form').text()).toContain('synthetic.pdf')
  })

  it('upload passes file and provenance through FormData', async () => {
    auth()
    vi.spyOn(patientService, 'getDocuments').mockResolvedValue([])
    const upload = vi.spyOn(patientService, 'uploadDocument').mockResolvedValue({})
    const wrapper = mount(PatientDocumentsPanel, { props: { patient: patient() } })
    await flushPromises()
    const file = new File(['synthetic'], 'synthetic.pdf', { type: 'application/pdf' })
    Object.defineProperty(wrapper.get('input[type=file]').element, 'files', { value: [file] })
    await wrapper.get('input[type=file]').trigger('change')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(upload.mock.calls[0][0]).toBe(7)
    const body = upload.mock.calls[0][1]
    expect(body).toBeInstanceOf(FormData)
    expect(body.get('file')).toBe(file)
    expect(body.get('verification')).toBe('unknown')
    expect(body.has('document_date')).toBe(false)
  })

  it('archive cancellation prevents mutation; confirmation passes document version', async () => {
    auth()
    vi.spyOn(patientService, 'getDocuments').mockResolvedValue([documentRow()])
    const archive = vi.spyOn(patientService, 'archiveDocument').mockResolvedValue({})
    const wrapper = mount(PatientDocumentsPanel, { props: { patient: patient() } })
    await flushPromises()
    await button(wrapper, 'أرشفة المستند').trigger('click')
    useConfirmStore().onCancel()
    await flushPromises()
    expect(archive).not.toHaveBeenCalled()
    await button(wrapper, 'أرشفة المستند').trigger('click')
    useConfirmStore().onConfirm()
    await flushPromises()
    expect(archive).toHaveBeenCalledWith(7, 11, 2)
  })

  it('archived patient keeps document download but has no metadata mutations', async () => {
    auth()
    vi.spyOn(patientService, 'getDocuments').mockResolvedValue([documentRow()])
    const wrapper = mount(PatientDocumentsPanel, { props: { patient: { ...patient(), is_active: false } } })
    await flushPromises()
    expect(button(wrapper, 'تنزيل')).toBeDefined()
    expect(wrapper.find('form').exists()).toBe(false)
    expect(button(wrapper, 'تعديل البيانات')).toBeUndefined()
    expect(button(wrapper, 'أرشفة المستند')).toBeUndefined()
  })
})

describe('optional duplicate review and merge', () => {
  async function duplicatePanel() {
    vi.spyOn(patientService, 'findDuplicates').mockResolvedValue({ matches: [{ id: 8, full_name: 'Synthetic match', patient_number: 'P-8', is_active: true }] })
    const wrapper = mount(PatientDuplicatePanel, { props: { patient: patient() }, attachTo: document.body })
    await button(wrapper, 'البحث عن ملفات متشابهة').trigger('click')
    await flushPromises()
    return wrapper
  }

  it('dismiss removes the match and passes parent version without merging', async () => {
    auth()
    const review = vi.spyOn(patientService, 'reviewDuplicate').mockResolvedValue({ version: 5 })
    const merge = vi.spyOn(patientService, 'mergePatient')
    const wrapper = await duplicatePanel()
    await button(wrapper, 'شخص مختلف').trigger('click')
    await flushPromises()
    expect(review).toHaveBeenCalledWith(7, expect.objectContaining({ other_id: 8, status: 'different', version: 4 }))
    expect(merge).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('Synthetic match')
    expect(wrapper.emitted('changed')[0]).toEqual([5])
  })

  it('merge requires reason and explicit confirmation and uses preview versions', async () => {
    auth()
    vi.spyOn(patientService, 'previewMerge').mockResolvedValue({ token: 'synthetic-preview', source: 'P-8', survivor: 'P-7', version: 2, target_version: 4, counts: { contacts: 1 } })
    const merge = vi.spyOn(patientService, 'mergePatient').mockResolvedValue({ version: 5 })
    const wrapper = await duplicatePanel()
    await button(wrapper, 'معاينة دمج هذا الملف في الملف الحالي').trigger('click')
    await flushPromises()
    const dialog = document.querySelector('[role=dialog]')
    const execute = [...dialog.querySelectorAll('button')].find(node => node.textContent.trim() === 'تنفيذ الدمج')
    expect(execute.disabled).toBe(true)
    const reason = dialog.querySelector('textarea')
    reason.value = 'Same synthetic patient'; reason.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()
    expect(execute.disabled).toBe(true)
    const checkbox = dialog.querySelector('input[type=checkbox]')
    checkbox.checked = true; checkbox.dispatchEvent(new Event('change', { bubbles: true }))
    await flushPromises()
    expect(execute.disabled).toBe(false)
    await wrapper.setProps({ patient: { ...patient(), version: 99 } })
    execute.click()
    await flushPromises()
    expect(merge).toHaveBeenCalledWith(8, { token: 'synthetic-preview', reason: 'Same synthetic patient', version: 2, target_version: 4 })
    expect(wrapper.emitted('changed')[0]).toEqual([5, true])
  })

  it('doctor can review duplicates but cannot see admin merge controls', async () => {
    auth('doctor', ['edit_patient'])
    const wrapper = await duplicatePanel()
    expect(button(wrapper, 'شخص مختلف')).toBeDefined()
    expect(button(wrapper, 'معاينة دمج هذا الملف في الملف الحالي')).toBeUndefined()
  })
})
