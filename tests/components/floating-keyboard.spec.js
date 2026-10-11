import { afterEach, describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useFloatingPosition } from '@/composables/useFloatingPosition'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import NotificationCenter from '@/features/notifications/components/NotificationCenter.vue'
import { useNotificationStore } from '@/features/notifications/stores/notifications'

afterEach(() => vi.unstubAllGlobals())

describe('floating panel geometry with controlled viewport measurements', () => {
  async function panel(direction = 'rtl', placement = 'start') {
    vi.stubGlobal('innerWidth', 400)
    vi.stubGlobal('innerHeight', 600)
    const wrapper = mount({ setup() {
      const trigger = ref(null)
      return { trigger, ...useFloatingPosition(trigger, { placement }) }
    }, template: '<button ref="trigger">Open</button><div ref="panelRef" :style="positionStyle">Panel</div>' }, { attachTo: document.body })
    const trigger = wrapper.get('button').element
    const element = wrapper.get('div').element
    trigger.style.direction = direction
    trigger.getBoundingClientRect = () => ({ left: 330, right: 380, top: 550, bottom: 580, width: 50, height: 30 })
    element.getBoundingClientRect = () => ({ width: Math.min(360, parseFloat(element.style.maxWidth) || 304), height: 100 })
    Object.defineProperty(element, 'scrollHeight', { value: 100 })
    await flushPromises()
    wrapper.vm.recalculate()
    await flushPromises()
    return { wrapper, element }
  }

  it.each(['rtl', 'ltr'])('bounds a panel that grows after its prior width limit in %s', async direction => {
    const { element } = await panel(direction)
    const width = element.getBoundingClientRect().width
    expect(parseFloat(element.style.left) + width).toBeLessThanOrEqual(392)
    expect(parseFloat(element.style.left)).toBeGreaterThanOrEqual(8)
    expect(parseFloat(element.style.top)).toBeLessThan(550)
  })

  it('uses visual viewport offsets and caps height in short landscapes', async () => {
    const viewport = new EventTarget()
    Object.assign(viewport, { offsetLeft: 50, offsetTop: 100, width: 280, height: 220 })
    vi.stubGlobal('visualViewport', viewport)
    const { wrapper, element } = await panel()
    const trigger = wrapper.get('button').element
    trigger.getBoundingClientRect = () => ({ left: 270, right: 310, top: 200, bottom: 230 })
    wrapper.vm.recalculate()
    await flushPromises()
    expect(parseFloat(element.style.left)).toBeGreaterThanOrEqual(58)
    expect(parseFloat(element.style.left) + element.getBoundingClientRect().width).toBeLessThanOrEqual(322)
    expect(parseFloat(element.style.maxHeight)).toBeLessThanOrEqual(108)
  })
})

describe('dropdown keyboard, focus and dismissal', () => {
  const actions = [{ label: 'Disabled', disabled: true }, { label: 'Enabled', onClick: vi.fn() }, { label: 'Last', onClick: vi.fn() }]
  it('disabled secondary actions cannot execute or emit', async () => {
    const wrapper = mount(DropdownMenu, { props: { secondaryActions: actions }, attachTo: document.body })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    const button = document.querySelector('.context-menu__item')
    expect(button.disabled).toBe(true)
    button.click()
    expect(wrapper.emitted('action')).toBeUndefined()
  })

  it('ArrowDown opens and focuses the first enabled action, Escape restores the trigger', async () => {
    const wrapper = mount(DropdownMenu, { props: { secondaryActions: actions }, attachTo: document.body })
    const trigger = wrapper.get('button').element
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await flushPromises()
    await vi.waitFor(() => expect(document.activeElement?.textContent.trim()).toBe('Enabled'))
    for (const [key, expected] of [['End', 'Last'], ['Home', 'Enabled'], ['ArrowUp', 'Last'], ['ArrowDown', 'Enabled']]) {
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
      await flushPromises()
      expect(document.activeElement?.textContent.trim()).toBe(expected)
    }
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(document.querySelector('.context-menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('focus departure closes a menu without taking focus from the next control', async () => {
    const wrapper = mount(DropdownMenu, { props: { secondaryActions: actions }, attachTo: document.body })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    const option = document.querySelectorAll('.context-menu__item')[1]
    option.focus()
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    await flushPromises()
    expect(document.querySelector('.context-menu')).toBeNull()
    expect(document.activeElement).toBe(outside)
  })
})

describe('notification shell panel', () => {
  async function center() {
    const store = useNotificationStore()
    store.unreadCount = 2
    store.notifications = [{ id: 1, title: 'Synthetic', message: 'Synthetic', is_read: false, created_at: '2026-10-11T09:00:00Z' }]
    const polling = vi.spyOn(store, 'startPolling').mockImplementation(() => {})
    vi.spyOn(store, 'fetchNotifications').mockResolvedValue()
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: {} }, { path: '/notifications', component: {} }] })
    await router.push('/')
    const wrapper = mount(NotificationCenter, { global: { plugins: [router] }, attachTo: document.body })
    await flushPromises()
    return { wrapper, store, router, polling }
  }

  it('badge follows store changes immediately without waiting for a poll', async () => {
    const { wrapper, store } = await center()
    expect(wrapper.text()).toContain('٢')
    store.unreadCount = 0
    await flushPromises()
    expect(wrapper.find('.badge__value').exists()).toBe(false)
  })

  it('Escape restores bell focus, and completed route navigation closes the persistent panel', async () => {
    const { wrapper, router } = await center()
    const bell = wrapper.get('button').element
    bell.focus()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(document.activeElement).toBe(bell)
    expect(wrapper.find('.notification-center__dropdown').exists()).toBe(false)
    await wrapper.get('button').trigger('click')
    await router.push('/notifications')
    await flushPromises()
    expect(wrapper.find('.notification-center__dropdown').exists()).toBe(false)
  })

  it('initialization delegates fetching to one polling owner', async () => {
    const { store, polling } = await center()
    expect(polling).toHaveBeenCalledOnce()
    expect(store.fetchNotifications).not.toHaveBeenCalled()
  })
})
