import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import PrescriptionHistory from '@/features/prescription/components/PrescriptionHistory.vue'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { changeSession } from '@/services/sessionState'
import { preparePrintWindow, printSavedPdf } from '@/features/prescription/services/prescriptionPrint'

const row = { id: 41, issued_at: '2026-10-13T10:00:00Z', visit_id: 7, visit_date: '13/10/2026', revision_number: 2,
  patient_name: 'مريض اصطناعي', doctor_name: 'طبيب اصطناعي', medication_count: 1, print_options: { mode: 'blank', width_mm: 105, height_mm: 148 } }
async function mounted() {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<p>History</p>' } }] })
  await router.push('/')
  return mount(PrescriptionHistory, { props: { patientId: 1 }, global: { plugins: [router] }, attachTo: document.body })
}
const click = async (wrapper, text) => wrapper.findAll('button').find(button => button.text() === text).trigger('click')
const historyResponse = items => ({ data: { data: { items, total: items.length, offset: 0, limit: 20 } } })

describe('saved prescription history and instructions', () => {
  it('reprints stored bytes and opens a separate patient handout without generating another prescription', async () => {
    vi.spyOn(prescriptionService, 'history').mockResolvedValue(historyResponse([row]))
    const saved = vi.spyOn(prescriptionService, 'savedPdf').mockResolvedValue({ data: new Blob(['%PDF-exact']) })
    const instructions = vi.spyOn(prescriptionService, 'instructions').mockResolvedValue({ data: new Blob(['%PDF-instructions']) })
    const generate = vi.spyOn(prescriptionService, 'generate')
    vi.spyOn(window, 'open').mockReturnValue(null)
    const create = vi.fn().mockReturnValueOnce('blob:saved').mockReturnValueOnce('blob:instructions')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
    const wrapper = await mounted()
    await flushPromises()
    await click(wrapper, 'إعادة طباعة')
    await flushPromises()
    expect(saved).toHaveBeenCalledWith(41)
    expect(wrapper.get('a[download]').attributes('href')).toBe('blob:saved')
    expect(wrapper.text()).toContain('تعذر فتح نافذة الطباعة')
    await click(wrapper, 'تعليمات المريض')
    await flushPromises()
    expect(instructions).toHaveBeenCalledWith(41)
    expect(wrapper.get('iframe').attributes('title')).toBe('معاينة تعليمات المريض')
    expect(wrapper.get('a[download]').attributes('download')).toBe('instructions_41.pdf')
    expect(revoke).toHaveBeenCalledWith('blob:saved')
    expect(generate).not.toHaveBeenCalled()
    changeSession(null)
    await flushPromises()
    expect(revoke).toHaveBeenCalledWith('blob:instructions')
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(row.patient_name)
  })

  it.each(['session', 'unmount', 'patient change'])('ignores a late saved-PDF response after %s and closes its pending popup', async reason => {
    vi.spyOn(prescriptionService, 'history').mockResolvedValue(historyResponse([row]))
    let finish
    vi.spyOn(prescriptionService, 'savedPdf').mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const popup = { opener: {}, document: { title: '', body: { textContent: '' } }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(popup)
    const create = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() }))
    const wrapper = await mounted()
    await flushPromises()
    await click(wrapper, 'إعادة طباعة')
    if (reason === 'session') changeSession(null)
    else if (reason === 'unmount') wrapper.unmount()
    else await wrapper.setProps({ patientId: 2 })
    finish({ data: new Blob(['%PDF-old-patient']) })
    await flushPromises()
    expect(create).not.toHaveBeenCalled()
    expect(popup.close).toHaveBeenCalledOnce()
  })

  it('retries failed history reads and paginates without issuing writes', async () => {
    const history = vi.spyOn(prescriptionService, 'history').mockRejectedValueOnce(new Error('Synthetic read failure'))
      .mockResolvedValueOnce({ data: { data: { items: [row], total: 21, offset: 0 } } })
      .mockResolvedValueOnce({ data: { data: { items: [{ ...row, id: 21 }], total: 21, offset: 20 } } })
    const wrapper = await mounted()
    await flushPromises()
    await click(wrapper, 'إعادة المحاولة')
    await flushPromises()
    await click(wrapper, 'التالي')
    await flushPromises()
    expect(history).toHaveBeenLastCalledWith(1, { offset: 20 })
    expect(wrapper.text()).toContain('وصفة #21')
    expect(wrapper.findAll('article')).toHaveLength(1)
  })

  it('opens a print window during the user gesture and prints only after navigating to the saved PDF', () => {
    let loaded
    const popup = { opener: {}, closed: false, document: { title: '', body: { textContent: '' } },
      location: { href: 'about:blank', replace: vi.fn() }, addEventListener: vi.fn((_, callback) => { loaded = callback }),
      removeEventListener: vi.fn(), focus: vi.fn(), print: vi.fn(), close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(popup)
    expect(preparePrintWindow()).toBe(popup)
    expect(popup.opener).toBeNull()
    expect(printSavedPdf('blob:exact', popup)).toBe(true)
    loaded()
    expect(popup.print).not.toHaveBeenCalled()
    popup.location.href = 'blob:exact'
    loaded()
    expect(popup.print).toHaveBeenCalledOnce()
  })
})
