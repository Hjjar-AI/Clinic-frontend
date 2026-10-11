import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ImportOptions from '@/features/import/views/ImportOptions.vue'
import BackupLayout from '@/features/backup/components/BackupLayout.vue'
import importService from '@/features/import/services/importService'

function button(wrapper, name) {
  return wrapper.findAll('button').find(node => node.text().trim().includes(name))
}
async function file(wrapper, selector) {
  const value = new File(['code,english,arabic\nSYN,Synthetic,اصطناعي'], 'synthetic.csv', { type: 'text/csv' })
  Object.defineProperty(wrapper.get(selector).element, 'files', { value: [value], configurable: true })
  await wrapper.get(selector).trigger('change')
  return value
}

describe('catalog import UI preview binding', () => {
  it('diagnosis preview sends no commit; the next submit binds file, mode and token', async () => {
    const preview = vi.spyOn(importService, 'previewDiagnoses').mockResolvedValue({ preview_token: 'synthetic-token', counts: { create: 1 } })
    const commit = vi.spyOn(importService, 'importDiagnoses').mockResolvedValue({ added: 1 })
    const wrapper = mount(ImportOptions)
    const selected = await file(wrapper, '#diagFile')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(preview).toHaveBeenCalledWith(selected, 'merge')
    expect(commit).not.toHaveBeenCalled()
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(commit).toHaveBeenCalledWith(selected, 'merge', 'synthetic-token')
    expect(button(wrapper, 'معاينة')).toBeDefined()
  })

  it('changing diagnosis mode invalidates the previous preview and requires confirmation', async () => {
    const preview = vi.spyOn(importService, 'previewDiagnoses').mockResolvedValue({ preview_token: 'old-token', counts: { create: 1 } })
    const commit = vi.spyOn(importService, 'importDiagnoses')
    const wrapper = mount(ImportOptions)
    await file(wrapper, '#diagFile')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    await wrapper.get('input[type=radio][value=replace]').setValue()
    expect(button(wrapper, 'معاينة').attributes('disabled')).toBeDefined()
    await wrapper.findAll('form')[0].get('input[type=checkbox]').setValue(true)
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(preview).toHaveBeenLastCalledWith(expect.any(File), 'replace')
    expect(commit).not.toHaveBeenCalled()
  })

  it('failed diagnosis preview does not promote the form to execution', async () => {
    const error = new Error('Invalid synthetic file')
    const errorHandler = vi.fn()
    vi.spyOn(importService, 'previewDiagnoses').mockRejectedValue(error)
    const commit = vi.spyOn(importService, 'importDiagnoses')
    const wrapper = mount(ImportOptions, { global: { config: { errorHandler } } })
    await file(wrapper, '#diagFile')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(button(wrapper, 'تنفيذ الاستيراد')).toBeUndefined()
    expect(commit).not.toHaveBeenCalled()
    expect(errorHandler).toHaveBeenCalledWith(error, expect.anything(), expect.any(String))
    expect(button(wrapper, 'معاينة').attributes('disabled')).toBeUndefined()
  })

  it('medication column mapping previews before committing with the new bound token', async () => {
    vi.spyOn(importService, 'uploadMedications').mockResolvedValue({ preview_rows: [['Synthetic']], columns: ['Name'], preview_token: 'upload-token' })
    const mapping = vi.spyOn(importService, 'mapMedications').mockResolvedValue({ preview_token: 'mapped-token', counts: { create: 1, update: 0, failed: 0 } })
    const wrapper = mount(ImportOptions)
    const selected = await file(wrapper, '#medFile')
    await wrapper.findAll('form')[1].trigger('submit')
    await flushPromises()
    await wrapper.get('#mapGenericEnglish').setValue('0')
    await wrapper.findAll('form')[2].trigger('submit')
    await flushPromises()
    expect(mapping).toHaveBeenLastCalledWith(selected, expect.objectContaining({ generic_english: 0 }), 'merge', 'upload-token', true)
    await wrapper.findAll('form')[2].trigger('submit')
    await flushPromises()
    expect(mapping).toHaveBeenLastCalledWith(selected, expect.objectContaining({ generic_english: 0 }), 'merge', 'mapped-token')
    expect(wrapper.find('#mapGenericEnglish').exists()).toBe(false)
  })

  it('changing medication mapping forces a new preview instead of using its old confirmation', async () => {
    vi.spyOn(importService, 'uploadMedications').mockResolvedValue({ preview_rows: [['Synthetic', 'Other']], columns: ['First', 'Second'], preview_token: 'upload-token' })
    const mapping = vi.spyOn(importService, 'mapMedications').mockResolvedValue({ preview_token: 'mapped-token', counts: { create: 1, update: 0, failed: 0 } })
    const wrapper = mount(ImportOptions)
    await file(wrapper, '#medFile')
    await wrapper.findAll('form')[1].trigger('submit')
    await flushPromises()
    await wrapper.get('#mapGenericEnglish').setValue('0')
    await wrapper.findAll('form')[2].trigger('submit')
    await flushPromises()
    await wrapper.get('#mapGenericEnglish').setValue('1')
    expect(button(wrapper, 'تأكيد استيراد الأدوية')).toBeUndefined()
    await wrapper.findAll('form')[2].trigger('submit')
    await flushPromises()
    expect(mapping.mock.calls.every(call => call[4] === true)).toBe(true)
    expect(mapping).toHaveBeenLastCalledWith(expect.any(File), expect.objectContaining({ generic_english: 1 }), 'merge', 'mapped-token', true)
  })
})

describe('recovery confirmation and scope controls', () => {
  const preview = () => ({ preview_token: 'synthetic-restore-token', patients_count: 2, visits_count: 3, medications_count: 4, media_files_count: 1, format_version: 2 })

  it('exports full ZIP by default and explicitly selects JSON export', async () => {
    const wrapper = mount(BackupLayout)
    await wrapper.findAll('form')[0].trigger('submit')
    expect(wrapper.emitted('create-backup')[0]).toEqual(['full'])
    await wrapper.get('#backupType').setValue('json')
    await wrapper.findAll('form')[0].trigger('submit')
    expect(wrapper.emitted('create-backup')[1]).toEqual(['json'])
  })

  it('preview requires a file and clear confirmation', async () => {
    const wrapper = mount(BackupLayout)
    expect(button(wrapper, 'معاينة الملف').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ hasFile: true })
    expect(button(wrapper, 'معاينة الملف').attributes('disabled')).toBeDefined()
    await wrapper.findAll('form')[1].findAll('input[type=checkbox]').at(-1).setValue(true)
    expect(button(wrapper, 'معاينة الملف').attributes('disabled')).toBeUndefined()
    await wrapper.findAll('form')[1].trigger('submit')
    expect(wrapper.emitted('preview-restore')[0]).toEqual([{ patients: true, diagnoses: true, medications: true }])
  })

  it('execution requires both the exact confirmation phrase and checkbox', async () => {
    const wrapper = mount(BackupLayout, { props: { hasFile: true, previewData: preview() } })
    const form = wrapper.findAll('form')[2]
    expect(button(wrapper, 'تنفيذ الاستعادة').attributes('disabled')).toBeDefined()
    await form.get('input:not([type=checkbox])').setValue('RESTORE CLINIC')
    expect(button(wrapper, 'تنفيذ الاستعادة').attributes('disabled')).toBeDefined()
    await form.get('input[type=checkbox]').setValue(true)
    expect(button(wrapper, 'تنفيذ الاستعادة').attributes('disabled')).toBeUndefined()
    await form.get('input:not([type=checkbox])').setValue('restore clinic')
    expect(button(wrapper, 'تنفيذ الاستعادة').attributes('disabled')).toBeDefined()
  })

  it('execution sends the preview token with the explicitly confirmed scope', async () => {
    const wrapper = mount(BackupLayout, { props: { hasFile: true, previewData: preview() } })
    const form = wrapper.findAll('form')[2]
    await form.get('input[type=checkbox]').setValue(true)
    await form.get('input:not([type=checkbox])').setValue('RESTORE CLINIC')
    await form.trigger('submit')
    expect(wrapper.emitted('execute-restore')[0]).toEqual([{
      patients: true, diagnoses: true, medications: true,
      confirm_clear: true, confirmation_phrase: 'RESTORE CLINIC', preview_token: 'synthetic-restore-token',
    }])
  })

  it('scope changes reset execution consent and request a new preview', async () => {
    const wrapper = mount(BackupLayout, { props: { hasFile: true, previewData: preview() } })
    const execution = wrapper.findAll('form')[2]
    await execution.get('input[type=checkbox]').setValue(true)
    await execution.get('input:not([type=checkbox])').setValue('RESTORE CLINIC')
    await wrapper.findAll('form')[1].findAll('input[type=checkbox]')[0].setValue(false)
    expect(wrapper.emitted('preview-reset')).toHaveLength(1)
    expect(button(wrapper, 'تنفيذ الاستعادة').attributes('disabled')).toBeDefined()
    expect(execution.get('input[type=checkbox]').element.checked).toBe(false)
  })

  it('selected recovery file is emitted without performing a restore', async () => {
    const wrapper = mount(BackupLayout)
    const selected = await file(wrapper, '#restoreFile')
    expect(wrapper.emitted('file-selected')[0]).toEqual([selected])
    expect(wrapper.emitted('execute-restore')).toBeUndefined()
  })
})
