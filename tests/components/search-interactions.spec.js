import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import SearchInput from '@/components/common/SearchInput.vue'

async function type(wrapper, value) {
  await wrapper.get('input').setValue(value)
  await vi.advanceTimersByTimeAsync(310)
  await flushPromises()
}
describe('search panel interactions and request ownership', () => {
  it('typing over a controlled selection clears the selection while retaining the new query', async () => {
    vi.useFakeTimers()
    const search = vi.fn().mockResolvedValue([{ id: 2, label: 'Replacement result' }])
    const wrapper = mount({ components: { SearchInput }, setup() {
      return { selected: ref({ id: 1, label: 'Previous selection' }), search }
    }, template: '<SearchInput v-model="selected" :search-fn="search" />' })
    await type(wrapper, 'Replacement query')
    expect(wrapper.vm.selected).toBeNull()
    expect(wrapper.get('input').element.value).toBe('Replacement query')
    expect(search).toHaveBeenCalledWith('Replacement query')
    expect(wrapper.text()).toContain('Replacement result')
  })
  it('invalidates a pending response immediately when a newer query is typed', async () => {
    vi.useFakeTimers()
    let resolve
    const search = vi.fn(() => new Promise(done => { resolve = done }))
    const wrapper = mount(SearchInput, { props: { searchFn: search } })
    await type(wrapper, 'old query')
    await wrapper.get('input').setValue('new query')
    resolve([{ id: 1, label: 'Obsolete result' }])
    await flushPromises()
    expect(wrapper.text()).not.toContain('Obsolete result')
  })

  it.each(['Escape', 'outside', 'clear'])('%s dismissal cannot be reopened by late work', async action => {
    vi.useFakeTimers()
    let resolve
    const wrapper = mount(SearchInput, { props: { searchFn: () => new Promise(done => { resolve = done }) }, attachTo: document.body })
    await type(wrapper, 'Synthetic query')
    if (action === 'Escape') await wrapper.get('input').trigger('keydown', { key: 'Escape' })
    else if (action === 'outside') document.body.click()
    else {
      await wrapper.get('input').setValue('')
    }
    resolve([{ id: 1, label: 'Late synthetic result' }])
    await flushPromises()
    expect(wrapper.find('.search-results').exists()).toBe(false)
  })

  it('unmount cancels a debounced search before it reaches the service', async () => {
    vi.useFakeTimers()
    const search = vi.fn().mockResolvedValue([])
    const wrapper = mount(SearchInput, { props: { searchFn: search } })
    await wrapper.get('input').setValue('Synthetic')
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(400)
    expect(search).not.toHaveBeenCalled()
  })

  it('arrow navigation and Enter select an option while focus remains on the input', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SearchInput, { props: { searchFn: async () => [{ id: 1, label: 'One' }, { id: 2, label: 'Two' }] }, attachTo: document.body })
    wrapper.get('input').element.focus()
    await type(wrapper, 'Synthetic')
    await wrapper.get('input').trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.get('input').attributes('aria-activedescendant')).toBe(`${wrapper.get('input').attributes('aria-controls')}-1`)
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select').at(-1)).toEqual([{ id: 2, label: 'Two' }])
    expect(document.activeElement).toBe(wrapper.get('input').element)
    expect(wrapper.get('input').attributes('aria-expanded')).toBe('false')
  })

  it('exposes a unique controlled listbox and renders empty results inside the panel', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SearchInput, { props: { searchFn: async () => [] } })
    await type(wrapper, 'No matches')
    const input = wrapper.get('input')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get(`#${input.attributes('aria-controls')}`).attributes('role')).toBe('listbox')
    expect(wrapper.get('.search-results .no-results').text()).toContain('لا توجد نتائج')
  })

  it('click selection renders labels as text and never persists patient names', async () => {
    vi.useFakeTimers()
    const item = { id: 1, label: '<img src=x onerror=alert(1)> Synthetic' }
    const wrapper = mount(SearchInput, { props: { searchFn: async () => [item], highlight: true } })
    await type(wrapper, 'Synthetic')
    expect(wrapper.find('img').exists()).toBe(false)
    await wrapper.get('.search-result-item').trigger('click')
    expect(wrapper.emitted('select').at(-1)).toEqual([item])
    expect(localStorage.getItem('clinic_recent_searches')).toBeNull()
  })

  it('failed search exits loading and exposes a recoverable empty state', async () => {
    vi.useFakeTimers()
    const search = vi.fn().mockRejectedValueOnce(new Error('Synthetic failure')).mockResolvedValueOnce([{ id: 1, label: 'Recovered' }])
    const wrapper = mount(SearchInput, { props: { searchFn: search } })
    await type(wrapper, 'Broken')
    expect(wrapper.find('.search-spinner').exists()).toBe(false)
    await type(wrapper, 'Retry')
    expect(wrapper.text()).toContain('Recovered')
  })
})
