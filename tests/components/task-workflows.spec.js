import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import apiClient from '@/services/apiClient'
import TasksPage from '@/features/tasks/views/TasksPage.vue'
import TaskFormInline from '@/features/tasks/components/TaskFormInline.vue'
import { useTaskStore } from '@/features/tasks/stores/tasks'
import { useConfirmStore } from '@/stores/confirm'

const task = (status = 'open') => ({ id: 41, title: 'Synthetic task', status, version: 3, due_date: null })
const response = (config, data) => ({ data: { data }, status: 200, headers: {}, config })
async function page(items = [], path = '/tasks') {
  const requests = []
  let saved = items.map(item => ({ ...item }))
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    if (config.method === 'get') return response(config, {
      items: saved.filter(item => !config.params.status || item.status === config.params.status).map(item => ({ ...item })),
      meta: { has_more: false },
    })
    if (config.method === 'delete') {
      saved = saved.filter(item => item.id !== 41)
      return { ...response(config, null), status: 204 }
    }
    const updated = { ...JSON.parse(config.data), id: config.method === 'post' ? 42 : 41, version: config.method === 'post' ? 1 : 4 }
    if (config.method === 'post') saved.push(updated)
    else saved = saved.map(item => item.id === updated.id ? { ...item, ...updated } : item)
    return response(config, updated)
  }
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/tasks', component: TasksPage, meta: { breadcrumb: 'Tasks' } },
  ] })
  await router.push(path)
  const wrapper = mount(TasksPage, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, requests, store: useTaskStore() }
}

describe('rendered task creation uses the real store and service', () => {
  it.each(['', '2026-10-20'])('creates from the page with optional due date %s', async date => {
    const { wrapper, requests, store } = await page()
    await wrapper.get('.page-header-new button').trigger('click')
    await wrapper.get('form input:not([type=date])').setValue('Synthetic new task')
    await wrapper.get('form input[type=date]').setValue(date)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    const writes = requests.filter(request => request.method === 'post')
    expect(writes).toHaveLength(1)
    expect(JSON.parse(writes[0].data)).toEqual({ title: 'Synthetic new task', due_date: date || null })
    expect(store.items).toContainEqual(expect.objectContaining({ id: 42, title: 'Synthetic new task' }))
    expect(wrapper.get('tbody').text()).toContain('Synthetic new task')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('failed creation keeps entered title and date and enables retry', async () => {
    const { wrapper } = await page()
    const create = vi.spyOn(useTaskStore(), 'create').mockRejectedValue(new Error('Synthetic rejection'))
    await wrapper.get('.page-header-new button').trigger('click')
    await wrapper.get('form input:not([type=date])').setValue('Retain this draft')
    await wrapper.get('form input[type=date]').setValue('2026-10-20')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(create).toHaveBeenCalledOnce()
    expect(wrapper.get('form input:not([type=date])').element.value).toBe('Retain this draft')
    expect(wrapper.get('form input[type=date]').element.value).toBe('2026-10-20')
    expect(wrapper.get('form button').element.disabled).toBe(false)
  })

  it('inline form creates through the real store, resets values and emits completion', async () => {
    let request
    apiClient.defaults.adapter = async config => {
      request = config
      return response(config, { id: 42, ...JSON.parse(config.data) })
    }
    const wrapper = mount(TaskFormInline)
    await wrapper.get('input:not([type=hidden])').setValue('Inline synthetic task')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(JSON.parse(request.data)).toEqual({ title: 'Inline synthetic task', due_date: null })
    expect(wrapper.emitted('task-added')).toHaveLength(1)
    expect(wrapper.get('input:not([type=hidden])').element.value).toBe('')
  })

  it('blank page titles never make a mutation request', async () => {
    const { wrapper, requests } = await page()
    await wrapper.get('.page-header-new button').trigger('click')
    await wrapper.get('form input:not([type=date])').setValue('   ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(requests.filter(request => request.method === 'post')).toHaveLength(0)
  })

  it('failed inline creation retains the draft, releases loading and emits no completion', async () => {
    const create = vi.spyOn(useTaskStore(), 'create').mockRejectedValue(new Error('Synthetic rejection'))
    const wrapper = mount(TaskFormInline)
    await wrapper.get('input:not([type=hidden])').setValue('Keep this inline draft')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(create).toHaveBeenCalledWith({ title: 'Keep this inline draft', due_date: null })
    expect(wrapper.get('input:not([type=hidden])').element.value).toBe('Keep this inline draft')
    expect(wrapper.get('button').element.disabled).toBe(false)
    expect(wrapper.emitted('task-added')).toBeUndefined()
  })
})

describe('task lifecycle controls preserve the rendered version and draft', () => {
  it.each(['open', 'in_progress', 'completed', 'cancelled'])('offers only valid actions for %s', async status => {
    const { wrapper } = await page([task(status)])
    const row = wrapper.get('tbody tr')
    const active = ['open', 'in_progress'].includes(status)
    expect(row.find('button[title="إكمال"]').exists()).toBe(active)
    expect(row.find('button[title="إلغاء"]').exists()).toBe(active)
    expect(row.find('button[title="بدء التنفيذ"]').exists()).toBe(status === 'open')
    expect(row.find('button[title="إعادة الفتح"]').exists()).toBe(!active)
    expect(row.get('button[title="حذف"]').element.disabled).toBe(active)
  })

  it('start sends the opening version and updates the actual store', async () => {
    const { wrapper, requests, store } = await page([task()])
    await wrapper.get('button[title="بدء التنفيذ"]').trigger('click')
    await flushPromises()
    const write = requests.find(request => request.method === 'put')
    expect(write.url).toBe('/tasks/41/transition/')
    expect(JSON.parse(write.data)).toEqual({ status: 'in_progress', version: 3, reason: '' })
    expect(store.items[0].status).toBe('in_progress')
  })

  it('cancel dismissal makes no write and a confirmed reason uses the opening version', async () => {
    const { wrapper, requests } = await page([task()])
    await wrapper.get('button[title="إلغاء"]').trigger('click')
    useConfirmStore().onCancel()
    await flushPromises()
    expect(requests.filter(request => request.method === 'put')).toHaveLength(0)
    await wrapper.get('button[title="إلغاء"]').trigger('click')
    useConfirmStore().onConfirm('Synthetic cancellation')
    await flushPromises()
    const write = requests.find(request => request.method === 'put')
    expect(JSON.parse(write.data)).toEqual({ status: 'cancelled', version: 3, reason: 'Synthetic cancellation' })
  })

  it('stale start retains the original row status and version', async () => {
    const { wrapper, store } = await page([task()])
    const transition = vi.spyOn(store, 'transitionTask').mockRejectedValue(new Error('Synthetic stale version'))
    await wrapper.get('button[title="بدء التنفيذ"]').trigger('click')
    await flushPromises()
    expect(transition).toHaveBeenCalledWith(41, 'in_progress', 3)
    expect(store.items[0]).toMatchObject({ status: 'open', version: 3 })
    expect(wrapper.get('tbody tr').text()).toContain('مفتوحة')
  })

  it('confirmed deletion refreshes the rendered list after the store replaces its array', async () => {
    const { wrapper, requests, store } = await page([task('cancelled')])
    await wrapper.get('button[title="حذف"]').trigger('click')
    useConfirmStore().onConfirm()
    await flushPromises()
    useConfirmStore().onConfirm()
    await flushPromises()
    expect(requests.filter(request => request.method === 'delete')).toHaveLength(1)
    expect(store.items).toEqual([])
    expect(wrapper.get('tbody').text()).not.toContain('Synthetic task')
    expect(wrapper.get('tbody').text()).toContain('لا توجد مهام')
  })

  it('a successful transition reapplies the active status filter to the rendered rows', async () => {
    const { wrapper, requests } = await page([task()], '/tasks?status=open')
    await wrapper.get('button[title="بدء التنفيذ"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('tbody').text()).not.toContain('Synthetic task')
    expect(requests.filter(request => request.method === 'get')).toHaveLength(2)
    expect(requests.at(-1).params.status).toBe('open')
  })
})
