import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import apiClient from '@/services/apiClient'
import Notifications from '@/features/notifications/views/Notifications.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useNotificationStore } from '@/features/notifications/stores/notifications'

async function page({ read = false, link = '/patients/7', empty = false } = {}) {
  useAuthStore().user = { id: 3, username: 'synthetic' }
  const store = useNotificationStore()
  const requests = []
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    return { status: 200, headers: {}, config, data: { data: config.method === 'get'
      ? { items: empty ? [] : [{ id: 81, title: 'Synthetic notice', message: 'Synthetic message', link, is_read: read }], meta: { unread_count: empty || read ? 0 : 1 } }
      : {} } }
  }
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/notifications', component: Notifications },
    { path: '/patients/7', component: { template: '<p>Synthetic patient</p>' } },
  ] })
  await router.push('/notifications')
  const wrapper = mount(Notifications, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router, store, requests }
}

describe('notification page ownership and navigation', () => {
  it('loads actual service envelopes and marks unread content before navigating', async () => {
    const { wrapper, router, store, requests } = await page()
    expect(requests[0].url).toBe('/notifications/')
    expect(store.unreadCount).toBe(1)
    await wrapper.get('button.notification-content').trigger('click')
    await flushPromises()
    expect(requests[1].url).toBe('/notifications/81/mark_read/')
    expect(store.unreadCount).toBe(0)
    expect(store.notifications[0].is_read).toBe(true)
    expect(router.currentRoute.value.path).toBe('/patients/7')
  })

  it('already-read content navigates without another mutation', async () => {
    const { wrapper, router, requests } = await page({ read: true })
    await wrapper.get('button.notification-content').trigger('click')
    await flushPromises()
    expect(requests.filter(request => request.method !== 'get')).toHaveLength(0)
    expect(router.currentRoute.value.path).toBe('/patients/7')
  })

  it.each(['https://example.test', '//example.test', 'javascript:alert(1)', null])('unsafe or absent link %s stays on the page', async link => {
    const { wrapper, router, store } = await page({ link })
    expect(wrapper.get('button.notification-content').classes()).not.toContain('notification-content--linked')
    await wrapper.get('button.notification-content').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/notifications')
    expect(store.unreadCount).toBe(0)
  })

  it.each([true, false])('deletion of read=%s updates the actual store and empty state', async read => {
    const { wrapper, store, requests } = await page({ read })
    await wrapper.get('button.btn--danger').trigger('click')
    await flushPromises()
    expect(requests.find(request => request.method === 'delete').url).toBe('/notifications/81/')
    expect(store.notifications).toEqual([])
    expect(store.unreadCount).toBe(0)
    expect(wrapper.text()).toContain('لا توجد إشعارات')
  })

  it('empty response exposes no mutation controls', async () => {
    const { wrapper, store } = await page({ empty: true })
    expect(wrapper.text()).toContain('لا توجد إشعارات')
    expect(wrapper.find('button.notification-content').exists()).toBe(false)
    expect(wrapper.find('button.btn--danger').exists()).toBe(false)
    expect(store.unreadCount).toBe(0)
  })
})
