import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, ref } from 'vue'
import PrescriptionPaperOptions from '@/features/prescription/components/PrescriptionPaperOptions.vue'
import PrescriptionPreview from '@/features/prescription/views/PrescriptionPreview.vue'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { defaultPaperOptions, normalizePaperOptions } from '@/features/prescription/services/prescriptionPaper'

describe('prescription physical paper controls', () => {
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
    await wrapper.get('button').trigger('click')
    const issue = () => wrapper.findAll('button').find(button => button.text().includes('إنشاء وطباعة'))
    await issue().trigger('click')
    await flushPromises()
    expect(generate).toHaveBeenCalledWith(expect.objectContaining({ visit_id: '7', preview_token: 'synthetic-token', print_options: defaultPaperOptions() }))
    expect(issue().element.disabled).toBe(true)
    expect(revoke).toHaveBeenCalledWith('blob:synthetic')
    await wrapper.findAll('button').find(button => button.text().includes('معاينة جديدة')).trigger('click')
    await flushPromises()
    expect(preview).toHaveBeenCalledTimes(2)
    expect(issue().element.disabled).toBe(false)
  })
})
