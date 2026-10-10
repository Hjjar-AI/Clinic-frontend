import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useConfirmStore } from '@/stores/confirm'
import apiClient from '@/services/apiClient'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import ScoreInput from '@/components/ui/ScoreInput.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import DataTable from '@/components/ui/DataTable.vue'
import FileUpload from '@/components/common/FileUpload.vue'

describe('buttons and confirmation', () => {
  it('emits clicks for enabled buttons and blocks disabled buttons', async () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    await wrapper.setProps({ disabled: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
  it('loading disables button and exposes progress text', () => {
    const wrapper = mount(BaseButton, { props: { loading: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })
  it('confirmation cancellation prevents the action; acceptance emits confirmed', async () => {
    const wrapper = mount(BaseButton, { props: { confirmMessage: 'Confirm synthetic action' } })
    await wrapper.trigger('click')
    useConfirmStore().onCancel()
    await flushPromises()
    expect(wrapper.emitted('click')).toBeUndefined()
    await wrapper.trigger('click')
    useConfirmStore().onConfirm()
    await flushPromises()
    expect(wrapper.emitted('confirmed')).toHaveLength(1)
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
  it('external links include safe target and rel attributes', () => {
    const wrapper = mount(BaseButton, { props: { href: 'https://example.test' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.attributes('target')).toBe('_blank')
  })
  it('router links navigate through the real memory router', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: {} }, { path: '/patients', component: {} }] })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(BaseButton, { props: { to: '/patients' }, global: { plugins: [router] } })
    await wrapper.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/patients')
  })
})
describe('form controls', () => {
  it('labels reference unique input ids and errors set aria-invalid', () => {
    const wrapper = mount(FormInput, { props: { label: 'Synthetic name', error: 'Required' } })
    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('input').attributes('id'))
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Required')
  })
  it('emits changed model values and blur events', async () => {
    const wrapper = mount(FormInput, { props: { modelValue: '' } })
    await wrapper.get('input').setValue('Synthetic')
    await wrapper.get('input').trigger('blur')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Synthetic'])
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })
  it.each(['tel', 'email', 'url', 'number'])('%s controls are LTR inside Arabic forms', type => {
    expect(mount(FormInput, { props: { type } }).get('input').attributes('dir')).toBe('ltr')
  })
  it('explicit direction overrides control defaults', () => {
    expect(mount(FormInput, { props: { type: 'tel', direction: 'rtl' } }).get('input').attributes('dir')).toBe('rtl')
  })
  it('select retains numeric identifiers', async () => {
    const wrapper = mount(FormSelect, { props: { options: [{ value: 5, label: 'Synthetic doctor' }], modelValue: '' } })
    await wrapper.get('select').setValue(5)
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([5])
  })
  it('slider carries bounds and step and emits numeric answers', async () => {
    const wrapper = mount(ScoreInput, { props: { type: 'slider', min: 0, max: 10, step: 2, modelValue: 0 } })
    const input = wrapper.get('input')
    expect(input.attributes('step')).toBe('2')
    await input.setValue('4')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([4])
  })
})
describe('page, table and upload states', () => {
  it('error page emits retry without showing content', async () => {
    const wrapper = mount(PageContainer, { props: { status: 'error', errorMessage: 'Synthetic failure' }, slots: { default: '<p>private content</p>' } })
    expect(wrapper.text()).toContain('Synthetic failure')
    expect(wrapper.text()).not.toContain('private content')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
  it('content page honors width and slot', () => {
    const wrapper = mount(PageContainer, { props: { status: 'content', width: 'form' }, slots: { default: '<p>Form</p>' } })
    expect(wrapper.classes()).toContain('page-wrapper--form')
    expect(wrapper.text()).toContain('Form')
  })
  it('table selection targets visible ids and does not trigger row navigation', async () => {
    const wrapper = mount(DataTable, { props: { columns: [{ key: 'name', label: 'Name' }], items: [{ id: 1, name: 'Synthetic' }], selectable: true } })
    const checks = wrapper.findAll('input[type=checkbox]')
    await checks[0].setValue(true)
    expect(wrapper.emitted('toggle-all')[0]).toEqual([true, [1]])
    await checks[1].trigger('click')
    expect(wrapper.emitted('row-click')).toBeUndefined()
  })
  it('upload selection mode emits file without sending network request', async () => {
    const wrapper = mount(FileUpload, { props: { autoUpload: false } })
    const file = new File(['Synthetic'], 'suite.csv', { type: 'text/csv' })
    Object.defineProperty(wrapper.get('input').element, 'files', { value: [file], configurable: true })
    await wrapper.get('input').trigger('change')
    expect(wrapper.emitted('select')[0]).toEqual([file])
    expect(wrapper.text()).toContain('تم اختيار الملف')
    expect(wrapper.emitted('upload')).toBeUndefined()
  })
  it('oversized files are rejected before upload', async () => {
    const wrapper = mount(FileUpload, { props: { maxSizeMb: 0.000001 } })
    const file = new File(['too large'], 'suite.csv')
    Object.defineProperty(wrapper.get('input').element, 'files', { value: [file] })
    await wrapper.get('input').trigger('change')
    expect(wrapper.emitted('select')[0]).toEqual([null])
    expect(wrapper.text()).toContain('يتجاوز')
  })
  it('automatic upload sends multipart data and emits successful payload', async () => {
    let request
    apiClient.defaults.adapter = async config => {
      request = config
      return { data: { data: { id: 9 } }, headers: {}, status: 200, config }
    }
    const wrapper = mount(FileUpload, { props: { uploadUrl: '/patients/1/documents/', extraFields: { version: 3 } } })
    const file = new File(['Synthetic'], 'suite.pdf', { type: 'application/pdf' })
    Object.defineProperty(wrapper.get('input').element, 'files', { value: [file] })
    await wrapper.get('input').trigger('change')
    await flushPromises()
    expect(request.data).toBeInstanceOf(FormData)
    expect(request.data.get('version')).toBe('3')
    expect(wrapper.emitted('upload')[0]).toEqual([{ id: 9 }])
  })
})
describe('modal ownership', () => {
  it('renders accessible dialog and restores scroll state on teardown', async () => {
    document.body.style.overflow = 'auto'
    const wrapper = mount(BaseModal, { props: { modelValue: true, title: 'Synthetic dialog' }, attachTo: document.body, slots: { default: '<input aria-label="Synthetic field">' } })
    await flushPromises()
    const dialog = document.querySelector('[role=dialog]')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent).toContain('Synthetic dialog')
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
    expect(document.body.style.overflow).toBe('auto')
  })
  it('Escape closes only the active modal', async () => {
    const wrapper = mount(BaseModal, { props: { modelValue: true, title: 'Synthetic dialog' }, attachTo: document.body })
    await flushPromises()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })
})
