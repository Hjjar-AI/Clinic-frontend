import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ScalesAdmin from '@/features/clinical/views/ScalesAdmin.vue'
import scaleService from '@/features/clinical/services/scaleService'

async function page() {
  vi.spyOn(scaleService, 'getAll').mockResolvedValue({ items: [{ id: 61, version: 4, name: 'Synthetic scale', is_active: true, fields: [] }], meta: { has_more: false } })
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/scales', component: ScalesAdmin }] })
  await router.push('/scales')
  const wrapper = mount(ScalesAdmin, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return wrapper
}
async function confirm() {
  document.querySelector('.modal__footer .btn--primary').click()
  await flushPromises()
}
describe('scale creation and question forms', () => {
  it('scale name and question controls have associated labels', async () => {
    const wrapper = await page()
    await wrapper.get('.page-header-new button').trigger('click')
    await flushPromises()
    const label = document.querySelector('.modal__body label')
    expect(document.getElementById(label.htmlFor)?.tagName).toBe('INPUT')
    document.querySelector('.modal__close').click()
    await flushPromises()
    await wrapper.get('button[title="إضافة سؤال"]').trigger('click')
    await flushPromises()
    for (const node of document.querySelectorAll('.modal__body label')) {
      expect(['INPUT', 'SELECT'].includes(document.getElementById(node.htmlFor)?.tagName)).toBe(true)
    }
  })

  it('question save sends numeric bounds and the opening scale version', async () => {
    const add = vi.spyOn(scaleService, 'addField').mockResolvedValue({})
    const wrapper = await page()
    await wrapper.get('button[title="إضافة سؤال"]').trigger('click')
    await flushPromises()
    const input = document.querySelector('.modal__body input:not([type=number])')
    input.value = 'Synthetic question'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await confirm()
    expect(add).toHaveBeenCalledWith(61, {
      version: 4, label: 'Synthetic question', field_type: 'slider', min_val: 0, max_val: 10, step: 1, default: 0, options: '',
    })
    expect(document.querySelector('[role=dialog]')).toBeNull()
  })

  it('rejected question retains inputs and the open modal without unhandled errors', async () => {
    vi.spyOn(scaleService, 'addField').mockRejectedValue(new Error('Synthetic invalid range'))
    const wrapper = await page()
    await wrapper.get('button[title="إضافة سؤال"]').trigger('click')
    await flushPromises()
    const input = document.querySelector('.modal__body input:not([type=number])')
    input.value = 'Keep this question'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await confirm()
    expect(input.value).toBe('Keep this question')
    expect(document.querySelector('[role=dialog]')).not.toBeNull()
  })

  it('dismissed create drafts are reset on the next open', async () => {
    const create = vi.spyOn(scaleService, 'create').mockResolvedValue({})
    const wrapper = await page()
    await wrapper.get('.page-header-new button').trigger('click')
    await flushPromises()
    const input = document.querySelector('.modal__body input')
    input.value = 'Discard synthetic'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector('.modal__close').click()
    await flushPromises()
    await wrapper.get('.page-header-new button').trigger('click')
    await flushPromises()
    expect(document.querySelector('.modal__body input').value).toBe('')
    expect(create).not.toHaveBeenCalled()
  })
})
