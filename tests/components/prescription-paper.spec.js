import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, ref } from 'vue'
import PrescriptionPaperOptions from '@/features/prescription/components/PrescriptionPaperOptions.vue'
import PrescriptionPreview from '@/features/prescription/views/PrescriptionPreview.vue'
import PrescriptionPdfPreview from '@/features/prescription/components/PrescriptionPdfPreview.vue'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { defaultPaperOptions, normalizePaperOptions, loadPaperOptions, rememberPaperOptions } from '@/features/prescription/services/prescriptionPaper'
import { changeSession } from '@/services/sessionState'

describe('prescription physical paper controls', () => {
  it('remembers only normalized paper settings for the current account on this device', () => {
    const paper = { ...defaultPaperOptions(), mode: 'preprinted', height_mm: 198, offset_x_mm: 2 }
    expect(rememberPaperOptions(7, { ...paper, patient_name: 'SYNTHETIC-PRIVATE' })).toBe(true)
    expect(loadPaperOptions(7)).toEqual(paper)
    expect(loadPaperOptions(8)).toEqual(defaultPaperOptions())
    expect(localStorage.getItem('clinic:prescription-paper:7')).not.toContain('PRIVATE')
    expect(rememberPaperOptions(null, paper)).toBe(false)
    expect(rememberPaperOptions(7, { ...paper, width_mm: 0 })).toBe(false)
    expect(loadPaperOptions(7)).toEqual(paper)
  })

  it('handles corrupt or unavailable browser storage and restores the custom preset', () => {
    localStorage.setItem('clinic:prescription-paper:7', 'invalid-json')
    expect(loadPaperOptions(7)).toEqual(defaultPaperOptions())
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable') })
    expect(rememberPaperOptions(7, defaultPaperOptions())).toBe(false)
    const wrapper = mount(PrescriptionPaperOptions, { props: { modelValue: { ...defaultPaperOptions(), height_mm: 198 } } })
    expect(wrapper.findAll('select')[1].element.value).toBe('custom')
    expect(wrapper.findAll('input')[1].element.value).toBe('198')
  })

  it('prints the loaded PDF directly and provides a fallback when the viewer denies printing', async () => {
    const wrapper = mount(PrescriptionPdfPreview, { props: { url: 'about:blank', filename: 'synthetic.pdf' }, attachTo: document.body })
    const frame = wrapper.get('iframe')
    await frame.trigger('load')
    const print = vi.spyOn(frame.element.contentWindow, 'print').mockImplementation(() => {})
    vi.spyOn(frame.element.contentWindow, 'focus').mockImplementation(() => {})
    await wrapper.get('button').trigger('click')
    expect(print).toHaveBeenCalledOnce()
    expect(wrapper.get('a[download]').attributes('download')).toBe('synthetic.pdf')
    print.mockImplementation(() => { throw new Error('Viewer denied') })
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    await wrapper.get('button').trigger('click')
    expect(open).toHaveBeenCalledWith('about:blank', '_blank')
    expect(wrapper.get('[role="status"]').text()).toContain('نافذة جديدة')
  })

  it.each([['session', 'calibration'], ['unmount', 'calibration'], ['session', 'generate'], ['unmount', 'generate']])('clears previews on %s and ignores late %s results', async (reason, pendingMethod) => {
    vi.spyOn(prescriptionService, 'preview').mockResolvedValue({ data: { data: {
      preview_token: 'synthetic-token', patient_id: 1, patient_name: 'Synthetic patient', medications: [], diagnoses: [],
    } } })
    let finish
    if (pendingMethod === 'calibration') vi.spyOn(prescriptionService, 'generate').mockResolvedValue({ data: new Blob(['%PDF-synthetic']) })
    vi.spyOn(prescriptionService, pendingMethod).mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/prescription/:visitId', component: PrescriptionPreview },
      { path: '/patients', name: 'PatientsList', component: { template: '<p>Patients</p>' } },
    ] })
    await router.push('/prescription/7')
    const createUrl = vi.fn(() => 'blob:synthetic-private')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revoke }))
    const wrapper = mount(PrescriptionPreview, { global: { plugins: [router], stubs: { SignaturePad: { template: '<button @click="$emit(\'save\', \'synthetic-signature\')">Save synthetic signature</button>' } } } })
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text().includes('Save synthetic')).trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('إنشاء ومعاينة')).trigger('click')
    await flushPromises()
    const issued = pendingMethod === 'calibration'
    expect(createUrl).toHaveBeenCalledTimes(issued ? 1 : 0)
    if (issued) await wrapper.findAll('button').find(button => button.text().includes('إنشاء ورقة معايرة')).trigger('click')
    if (reason === 'session') changeSession(null)
    else wrapper.unmount()
    if (issued) expect(revoke).toHaveBeenCalledWith('blob:synthetic-private')
    finish({ data: new Blob(['%PDF-synthetic']) })
    await flushPromises()
    expect(createUrl).toHaveBeenCalledTimes(issued ? 1 : 0)
  })
  it('defaults to A6 and validates finite sizes, precision and offsets', () => {
    expect(normalizePaperOptions(defaultPaperOptions())).toEqual(defaultPaperOptions())
    for (const changes of [{ width_mm: '' }, { height_mm: true }, { width_mm: 79 }, { height_mm: 351 }, { width_mm: Infinity }, { offset_x_mm: 6 }, { width_mm: 105.001 }, { mode: 'scan' }]) {
      expect(normalizePaperOptions({ ...defaultPaperOptions(), ...changes })).toBeNull()
    }
    expect(normalizePaperOptions({ ...defaultPaperOptions(), offset_x_mm: 2 }).offset_x_mm).toBe(0)
    expect(normalizePaperOptions({ ...defaultPaperOptions(), mode: 'preprinted', height_mm: '198.25', offset_x_mm: '-2' })).toMatchObject({ height_mm: 198.25, offset_x_mm: -2 })
  })

  it('updates custom dimensions without mutating the opening value, shows calibration and disables controls', async () => {
    const opening = defaultPaperOptions()
    const model = ref(opening)
    const disabled = ref(false)
    const wrapper = mount(defineComponent({ components: { PrescriptionPaperOptions }, setup: () => ({ model, disabled }), template: '<PrescriptionPaperOptions v-model="model" :disabled="disabled" />' }))
    await wrapper.findAll('select')[1].setValue('custom')
    await wrapper.findAll('input')[1].setValue('198')
    expect(model.value.height_mm).toBe(198)
    expect(opening.height_mm).toBe(148)
    await wrapper.findAll('select')[0].setValue('preprinted')
    expect(wrapper.get('img').attributes('src')).toBe('/static/prescription-paper-reference.jpeg')
    expect(wrapper.findAll('input')).toHaveLength(4)
    await wrapper.findAll('input')[0].setValue('0')
    const controls = wrapper.getComponent(PrescriptionPaperOptions)
    expect(controls.emitted('validity').at(-1)).toEqual([false])
    disabled.value = true
    await flushPromises()
    expect(controls.get('fieldset').element.disabled).toBe(true)
  })

  it('issues the selected A6 layout once and obtains a fresh preview for another copy', async () => {
    const preview = vi.spyOn(prescriptionService, 'preview').mockResolvedValue({ data: { data: {
      preview_token: 'synthetic-token', patient_id: 1, patient_name: 'Synthetic patient', medications: [], diagnoses: [],
    } } })
    const generate = vi.spyOn(prescriptionService, 'generate').mockResolvedValue({ data: new Blob(['%PDF-synthetic']) })
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/prescription/:visitId', component: PrescriptionPreview },
      { path: '/patients', name: 'PatientsList', component: { template: '<p>Patients</p>' } },
    ] })
    await router.push('/prescription/7')
    const createUrl = vi.fn(() => 'blob:synthetic')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revoke }))
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = mount(PrescriptionPreview, { global: { plugins: [router], stubs: { SignaturePad: { template: '<button @click="$emit(\'save\', \'synthetic-signature\')">Save synthetic signature</button>' } } } })
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text().includes('Save synthetic')).trigger('click')
    const issue = () => wrapper.findAll('button').find(button => button.text().includes('إنشاء ومعاينة'))
    await issue().trigger('click')
    await flushPromises()
    expect(generate).toHaveBeenCalledWith(expect.objectContaining({ visit_id: '7', preview_token: 'synthetic-token', print_options: defaultPaperOptions() }))
    expect(issue().element.disabled).toBe(true)
    expect(wrapper.get('iframe').attributes('src')).toBe('blob:synthetic')
    expect(wrapper.get('a[download]').attributes('href')).toBe('blob:synthetic')
    expect(revoke).not.toHaveBeenCalled()
    await wrapper.findAll('button').find(button => button.text().includes('معاينة جديدة')).trigger('click')
    await flushPromises()
    expect(preview).toHaveBeenCalledTimes(2)
    expect(issue().element.disabled).toBe(false)
    expect(revoke).toHaveBeenCalledWith('blob:synthetic')
    expect(generate).toHaveBeenCalledOnce()
  })
})
