import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import DateCell from '@/components/ui/DateCell.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import ScoreInput from '@/components/ui/ScoreInput.vue'
import DataTable from '@/components/ui/DataTable.vue'
import ListView from '@/components/ui/ListView.vue'
import AppTabs from '@/components/ui/AppTabs.vue'
import AppTabPanel from '@/components/ui/AppTabPanel.vue'
import EditableNotes from '@/components/ui/EditableNotes.vue'
import SignaturePad from '@/components/ui/SignaturePad.vue'
import { useConfirmStore } from '@/stores/confirm'
import { changeSession } from '@/services/sessionState'
import { useRouteQuery } from '@/composables/useRouteQuery'
import { useResourceLoad } from '@/composables/useResourceLoad'

async function router() {
  const result = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await result.push('/'); return result
}

describe('shared native control contracts', () => {
  it('cards preserve nested input Enter and Space behavior', async () => {
    const wrapper = mount(BaseCard, { props: { clickable: true }, slots: { default: '<input aria-label="Synthetic">' } })
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      wrapper.get('input').element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(wrapper.emitted('click')).toBeUndefined()
    await wrapper.trigger('keydown', { key: 'Enter' }); expect(wrapper.emitted('click')).toHaveLength(1)
  })
  it('nonclickable cards do not suppress keyboard defaults', () => {
    const wrapper = mount(BaseCard), event = new KeyboardEvent('keydown', { key: ' ', cancelable: true })
    wrapper.element.dispatchEvent(event); expect(event.defaultPrevented).toBe(false); expect(wrapper.emitted('click')).toBeUndefined()
  })
  it('numeric min/max and readonly belong to the native input', async () => {
    const wrapper = mount(FormInput, { props: { type: 'number', min: 0, max: 12, readonly: true } }), input = wrapper.get('input')
    expect(input.attributes('min')).toBe('0'); expect(input.attributes('max')).toBe('12'); expect(input.element.readOnly).toBe(true)
    await wrapper.setProps({ readonly: false }); await input.setValue('13'); expect(input.element.validity.rangeOverflow).toBe(true)
    await input.setValue('-1'); expect(input.element.validity.rangeUnderflow).toBe(true)
  })
  it('unknown scores display unassessed rather than a fabricated zero and can be reset', async () => {
    const wrapper = mount(ScoreInput, { props: { max: 10 } }); expect(wrapper.get('output').text()).toBe('غير مقيم')
    await wrapper.setProps({ modelValue: 4 }); await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null])
    await wrapper.get('input').setValue(''); expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null])
  })
  it('hydration failures keep controls disabled and prevent submit until retry succeeds', async () => {
    let resource
    const memory = await router()
    const wrapper = mount(defineComponent({ setup() { resource = useResourceLoad(); return () => h(FormWrapper, { ready: resource.ready.value, loadError: resource.error.value, onRetry: resource.retry }, () => h('input')) } }), { global: { plugins: [memory] } })
    await resource.load(async () => { throw Error('Synthetic') }); await flushPromises()
    expect(wrapper.get('fieldset').element.disabled).toBe(true); expect(wrapper.text()).toContain('تعذر تحميل')
    await wrapper.get('form').trigger('submit'); expect(wrapper.findComponent(FormWrapper).emitted('submit')).toBeUndefined()
    await resource.load(async () => {}); await flushPromises(); expect(wrapper.get('fieldset').element.disabled).toBe(false)
    await wrapper.get('form').trigger('submit'); expect(wrapper.findComponent(FormWrapper).emitted('submit')).toHaveLength(1)
  })
  it('modal confirmation validates required controls and pending dialogs cannot close', async () => {
    const wrapper = mount(BaseModal, { props: { modelValue: true, title: 'Synthetic', confirmText: 'Save' }, attachTo: document.body, slots: { default: '<input required aria-label="Synthetic name">' } })
    await flushPromises(); document.querySelector('.modal__footer .btn--primary').click(); await flushPromises()
    expect(wrapper.emitted('confirm')).toBeUndefined()
    document.querySelector('.modal__body input').value = 'Synthetic'; document.querySelector('.modal__footer .btn--primary').click(); await flushPromises()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    await wrapper.setProps({ loading: true }); document.querySelector('.modal__close').click(); await flushPromises()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
  it('confirmed and disabled router links cannot navigate before authorization', async () => {
    const memory = await router(); const wrapper = mount(BaseButton, { props: { to: '/patients', disabled: true }, global: { plugins: [memory] } })
    await wrapper.trigger('click'); await flushPromises(); expect(memory.currentRoute.value.path).toBe('/')
    await wrapper.setProps({ disabled: false, confirmMessage: 'Synthetic confirmation' }); await wrapper.trigger('click'); await flushPromises()
    expect(memory.currentRoute.value.path).toBe('/'); useConfirmStore().onCancel(); await flushPromises(); expect(memory.currentRoute.value.path).toBe('/')
    await wrapper.trigger('click'); useConfirmStore().onConfirm(); await flushPromises(); expect(memory.currentRoute.value.path).toBe('/patients')
  })
})

describe('list and keyboard ownership', () => {
  const columns = [{ key: 'name', label: 'Name' }], items = [{ id: 1, name: 'Synthetic' }]
  it('ListView forwards the visible select-all ids and read-only rows stay outside tab order', async () => {
    const wrapper = mount(ListView, { props: { columns, selectable: true, fetchFn: async () => ({ items }) } }); await flushPromises()
    await wrapper.get('thead input').setValue(true); expect(wrapper.emitted('toggle-all')[0]).toEqual([true, [1]])
    expect(wrapper.get('tbody tr').attributes('tabindex')).toBeUndefined()
  })
  it('table keyboard row activation does not intercept child buttons', async () => {
    const action = vi.fn(), wrapper = mount(DataTable, { props: { columns, items, onRowClick: action }, slots: { name: '<button>Owned action</button>' } })
    await wrapper.get('tbody tr').trigger('keydown', { key: 'Enter' }); expect(action).toHaveBeenCalledOnce()
    await wrapper.get('tbody button').trigger('keydown', { key: 'Enter' }); expect(action).toHaveBeenCalledOnce()
  })
  it('registered tabs own real content ids, roving focus and keyboard navigation', async () => {
    const wrapper = mount({ components: { AppTabs, AppTabPanel }, template: '<AppTabs><AppTabPanel id="one" label="One">First</AppTabPanel><AppTabPanel id="two" label="Two">Second</AppTabPanel></AppTabs>' }, { attachTo: document.body })
    await flushPromises(); const tabs = wrapper.findAll('[role=tab]'); expect(tabs[0].attributes('tabindex')).toBe('0'); expect(tabs[1].attributes('tabindex')).toBe('-1')
    const panel = document.getElementById(tabs[0].attributes('aria-controls')); expect(panel.textContent).toBe('First'); expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].attributes('id'))
    await tabs[0].trigger('keydown', { key: 'End' }); await flushPromises(); expect(tabs[1].attributes('aria-selected')).toBe('true'); expect(document.activeElement).toBe(tabs[1].element)
  })
  it('query refs coalesce filters and follow same-path Back/Forward-style changes', async () => {
    const memory = await router(); let a, b
    mount({ setup() { a = useRouteQuery('a'); b = useRouteQuery('b'); return () => null } }, { global: { plugins: [memory] } })
    a.value = 'first'; b.value = 'second'; await flushPromises(); expect(memory.currentRoute.value.query).toEqual({ a: 'first', b: 'second' })
    await memory.replace('/?a=back'); await flushPromises(); expect(a.value).toBe('back'); expect(b.value).toBe('')
  })
})

describe('privacy and signature state', () => {
  it('scratchpad removes legacy plaintext storage and clears on account change', async () => {
    localStorage.setItem('dashboard_notes_1', 'Synthetic legacy private text'); const wrapper = mount(EditableNotes, { props: { userId: 1 } })
    expect(localStorage.getItem('dashboard_notes_1')).toBeNull(); await wrapper.get('textarea').setValue('Synthetic new private text'); expect(localStorage.length).toBe(0)
    changeSession(2); await flushPromises(); expect(wrapper.get('textarea').element.value).toBe('')
  })
  it('signature PNG contains every stroke and any edit/clear invalidates the saved drawing', async () => {
    const context = { beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn() }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context); vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,Synthetic')
    const wrapper = mount(SignaturePad); const surface = wrapper.get('.signature-canvas')
    vi.spyOn(surface.element, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 300, height: 100 })
    for (const x of [10, 100]) { await surface.trigger('mousedown', { clientX: x, clientY: 10 }); await surface.trigger('mousemove', { clientX: x + 10, clientY: 20 }); await surface.trigger('mouseup') }
    const save = wrapper.findAll('button').find(button => button.text().includes('حفظ')); await save.trigger('click')
    expect(context.moveTo.mock.calls).toEqual([[10, 10], [100, 10]]); expect(context.lineTo).toHaveBeenCalledTimes(2); expect(wrapper.emitted('save')[0][0]).toMatch(/^data:image\/png/)
    const before = wrapper.emitted('change').length; const clear = wrapper.findAll('button').find(button => button.text().includes('مسح')); await clear.trigger('click')
    expect(wrapper.emitted('change').length).toBeGreaterThan(before); expect(wrapper.find('path').exists()).toBe(false)
  })
})


describe('standard feedback and clinical date presentation', () => {
  it('announces loading, prioritizes errors, offers one retry and clears resolved feedback', async () => {
    const wrapper = mount(ResourceFeedback, { props: { loading: true, retryable: true } })
    expect(wrapper.get('[role="status"]').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('button').exists()).toBe(false)
    await wrapper.setProps({ error: 'Synthetic lookup failure' })
    expect(wrapper.get('[role="alert"]').text()).toContain('Synthetic lookup failure')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
    await wrapper.setProps({ loading: false, error: '' })
    expect(wrapper.find('[role="alert"], [role="status"]').exists()).toBe(false)
  })

  it('does not imply that a failed write can be retried as a read', () => {
    const wrapper = mount(ResourceFeedback, { props: { error: 'Synthetic rejected write' } })
    expect(wrapper.get('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders exact calendar dates and rejects rollovers with a context-specific missing label', async () => {
    const wrapper = mount(DateCell, { props: { date: '2026-10-12', relative: false, emptyText: 'غير معروف' } })
    expect(wrapper.get('time bdi').text()).toBe('12/10/2026')
    expect(wrapper.get('time').attributes('title')).toBe('2026-10-12')
    await wrapper.setProps({ date: '2026-02-30' })
    expect(wrapper.find('time').exists()).toBe(false)
    expect(wrapper.text()).toBe('غير معروف')
    await wrapper.setProps({ date: null, emptyText: 'غير مسجل' })
    expect(wrapper.text()).toBe('غير مسجل')
  })
})
