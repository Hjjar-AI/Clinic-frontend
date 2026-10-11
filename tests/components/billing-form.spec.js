import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import apiClient from '@/services/apiClient'
import invoiceService from '@/features/billing/services/invoiceService'
import InvoiceForm from '@/features/billing/views/InvoiceForm.vue'

async function form(edit = false) {
  apiClient.defaults.adapter = async config => ({
    data: { data: config.url.includes('all_light') ? [{ id: 7, first_name: 'Synthetic', surname: 'Patient' }] : [] },
    status: 200, headers: {}, config,
  })
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/invoices/new', name: 'InvoiceCreate', component: InvoiceForm },
    { path: '/invoices/:id/edit', name: 'InvoiceEdit', component: InvoiceForm },
    { path: '/invoices', name: 'InvoicesList', component: { template: '<p>Invoice list</p>' } },
  ] })
  await router.push(edit ? '/invoices/11/edit' : '/invoices/new')
  const wrapper = mount({ template: '<RouterView />' }, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}
async function numbers(wrapper, total, tax = 0, discount = 0) {
  const inputs = wrapper.findAll('input[type=number]')
  await inputs[0].setValue(total)
  await inputs[1].setValue(tax)
  await inputs[2].setValue(discount)
  await flushPromises()
  return inputs[3]
}

describe('real billing form and navigation', () => {
  it('computes fractional totals and keeps the final total read-only', async () => {
    const { wrapper } = await form()
    const final = await numbers(wrapper, '10.75', '0.25', '1.50')
    expect(Number(final.element.value)).toBe(9.5)
    expect(wrapper.text()).toContain('SYP')
    expect(final.attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('input[type=number]').every(input => input.attributes('dir') === 'ltr')).toBe(true)
  })

  it('missing patient and negative amounts prevent submission', async () => {
    const create = vi.spyOn(invoiceService, 'create')
    const { wrapper } = await form()
    await numbers(wrapper, '-1')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.get('select[aria-label="المريض"]').attributes('aria-invalid')).toBe('true'))
    expect(create).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(wrapper.findAll('input[type=number]')[0].attributes('aria-invalid')).toBe('true'))
  })

  it('successful creation submits normalized dates and null visit and navigates without a dirty prompt', async () => {
    const create = vi.spyOn(invoiceService, 'create').mockResolvedValue({ id: 11 })
    const { wrapper, router } = await form()
    await wrapper.get('select[aria-label="المريض"]').setValue('7')
    await numbers(wrapper, '10.75', '0.25', '1.50')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await vi.waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ patient_id: '7', total_amount: 10.75, tax: 0.25, discount: 1.5, final_amount: 9.5, visit_id: null })))
    expect(create.mock.calls[0][0].issued_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('InvoicesList'))
    expect(document.querySelector('[role=dialog]')).toBeNull()
  })

  it('editing retains the version loaded with the invoice', async () => {
    vi.spyOn(invoiceService, 'getById').mockResolvedValue({ data: { data: {
      id: 11, version: 5, patient: 7, visit: null, total_amount: '12.50', tax: '0.50', discount: '1.00', final_amount: '12.00', issued_date: '2026-10-11', status: 'draft',
    } } })
    const update = vi.spyOn(invoiceService, 'update').mockResolvedValue({})
    const { wrapper, router } = await form(true)
    await wrapper.findAll('input[type=number]')[0].setValue('15.50')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('11', expect.objectContaining({ version: 5, patient_id: 7, total_amount: 15.5 })))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('InvoicesList'))
  })

  it('server rejection preserves entered amounts and remains on the form', async () => {
    vi.spyOn(invoiceService, 'create').mockRejectedValue({ response: { status: 409, data: { error: { message: 'Synthetic invoice conflict' } } } })
    const { wrapper, router } = await form()
    await wrapper.get('select[aria-label="المريض"]').setValue('7')
    await numbers(wrapper, '25.75')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('InvoiceCreate')
    expect(wrapper.findAll('input[type=number]')[0].element.value).toBe('25.75')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Synthetic invoice conflict'))
  })

  it('zero amounts remain valid values rather than missing required values', async () => {
    const create = vi.spyOn(invoiceService, 'create').mockResolvedValue({ id: 11 })
    const { wrapper } = await form()
    await wrapper.get('select[aria-label="المريض"]').setValue('7')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await vi.waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ total_amount: 0, final_amount: 0 })))
    await flushPromises()
  })
})
