import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import apiClient from '@/services/apiClient'
import Diagnoses from '@/features/clinical/views/DiagnosesManage.vue'
import Medications from '@/features/clinical/views/MedicationsManage.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useConfirmStore } from '@/stores/confirm'

const cases = [
  { title: 'diagnoses', component: Diagnoses, path: '/diagnoses', base: '/options/diagnoses/',
    open: 'إضافة تشخيص جديد', key: 'english_name', selector: '#diagEnglish',
    record: { code: 'SYN.1', english_name: 'Synthetic diagnosis', arabic_name: 'تشخيص اصطناعي' } },
  { title: 'medications', component: Medications, path: '/medications', base: '/options/medications/',
    open: 'إضافة دواء جديد', key: 'generic_english', selector: '#medGenericEnglish',
    record: { generic_english: 'Synthetic medication', generic_arabic: 'دواء اصطناعي', dosage: '10 mg', brand_english: '', brand_arabic: '' } },
]
async function page(spec, active = true) {
  let saved = { id: 71, version: 5, is_active: active, usage_count: 3, ...spec.record }
  const requests = []
  let rejectSave = false
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    if (rejectSave && config.method === 'put') throw Object.assign(new Error('Synthetic stale edit'), {
      config, response: { status: 409, data: { error: { message: 'Synthetic stale edit' } } },
    })
    let data
    if (config.method === 'get') data = { items: [{ ...saved }], meta: { has_more: false } }
    else {
      const payload = config.data ? JSON.parse(config.data) : {}
      saved = { ...saved, ...payload, version: saved.version + 1,
        is_active: config.method === 'delete' ? false : config.url.endsWith('reactivate/') ? true : saved.is_active }
      data = { ...saved }
    }
    return { data: { data }, status: config.method === 'post' ? 201 : 200, headers: {}, config }
  }
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: spec.path, component: spec.component }] })
  await router.push(spec.path)
  const wrapper = mount(spec.component, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, requests, reject: () => { rejectSave = true } }
}
async function save() {
  document.querySelector('.modal__footer .btn--primary').click()
  await flushPromises()
}

it('table actions expose modal edit buttons and retain invalid-route protection', async () => {
  const wrapper = mount(TableActions, { props: { showDelete: false } })
  await wrapper.get('button[title="تعديل"]').trigger('click')
  expect(wrapper.emitted('edit')).toHaveLength(1)
  await wrapper.setProps({ editTo: { name: 'Edit', params: { id: null } } })
  expect(wrapper.find('button[title="تعديل"]').exists()).toBe(false)
})

describe.each(cases)('$title actual list and modal CRUD', spec => {
  it('editing is reachable and sends the opening version and all owned fields', async () => {
    const { wrapper, requests } = await page(spec)
    await wrapper.get('button[title="تعديل"]').trigger('click')
    await flushPromises()
    expect(document.querySelector(spec.selector).value).toBe(spec.record[spec.key])
    const input = document.querySelector(spec.selector)
    input.value = 'Synthetic revised'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await save()
    const write = requests.find(config => config.method === 'put')
    expect(write.url).toBe(`${spec.base}71/`)
    expect(JSON.parse(write.data)).toMatchObject({ ...spec.record, [spec.key]: 'Synthetic revised', version: 5 })
    expect(document.querySelector('[role=dialog]')).toBeNull()
    expect(wrapper.get('tbody').text()).toContain('Synthetic revised')
  })

  it('stale save leaves the modal and draft open without an unhandled rejection', async () => {
    const { wrapper, requests, reject } = await page(spec)
    await wrapper.get('button[title="تعديل"]').trigger('click')
    await flushPromises()
    reject()
    const input = document.querySelector(spec.selector)
    input.value = 'Keep this catalog draft'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await save()
    expect(requests.filter(config => config.method === 'put')).toHaveLength(1)
    expect(document.querySelector(spec.selector).value).toBe('Keep this catalog draft')
    expect(document.querySelector('[role=dialog]')).not.toBeNull()
  })

  it('cancelled retirement performs no write; confirmation retires and reactivation refreshes', async () => {
    const { wrapper, requests } = await page(spec)
    await wrapper.get('button[title="حذف"]').trigger('click')
    useConfirmStore().onCancel()
    await flushPromises()
    expect(requests.filter(config => config.method === 'delete')).toHaveLength(0)
    await wrapper.get('button[title="حذف"]').trigger('click')
    useConfirmStore().onConfirm()
    await flushPromises()
    expect(wrapper.find('button[title="تعديل"]').exists()).toBe(false)
    await wrapper.get('button[title="إعادة التفعيل"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('button[title="تعديل"]').exists()).toBe(true)
    expect(requests.find(config => config.url.endsWith('reactivate/')).method).toBe('post')
  })

  it('opening a create modal after cancelling an edit clears its old values and version', async () => {
    const { wrapper, requests } = await page(spec)
    await wrapper.get('button[title="تعديل"]').trigger('click')
    await flushPromises()
    document.querySelector('.modal__close').click()
    await flushPromises()
    const add = wrapper.findAll('.page-header-new button').find(button => button.text().includes(spec.open))
    await add.trigger('click')
    await flushPromises()
    expect(document.querySelector(spec.selector).value).toBe('')
    const input = document.querySelector(spec.selector)
    input.value = 'New synthetic'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    if (spec.title === 'diagnoses') {
      for (const [selector, value] of [['#diagCode', 'SYN.NEW'], ['#diagArabic', 'تشخيص جديد اصطناعي']]) {
        const field = document.querySelector(selector)
        field.value = value
        field.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
    await save()
    expect(JSON.parse(requests.find(config => config.method === 'post').data).version).toBeUndefined()
  })
})
