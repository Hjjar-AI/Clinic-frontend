import { onSessionChange, sessionGeneration } from '@/services/sessionState'
import { reportError } from '@/utils/reportError'
// frontend/src/features/notifications/stores/notifications.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { useAuthStore } from '@/features/auth/stores/auth'
import notificationService from '@/features/notifications/services/notificationService'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)

  let pollingTimer = null
  const authStore = useAuthStore()

  function reset() {
    notifications.value = []
    unreadCount.value = 0
    loading.value = false
    error.value = null
  }

  onSessionChange(() => { stopPolling(); reset() })

  async function fetchAll() {
    const epoch = sessionGeneration()
    if (!authStore.isAuthenticated) {
      reset()
      return
    }
    loading.value = true
    error.value = null
    try {
      const data = await notificationService.getAll({ limit: 100 })
      notifications.value = data?.items || []
      unreadCount.value = data?.meta?.unread_count ?? 0
    } catch (e) {
      if (epoch !== sessionGeneration()) return
      error.value = e.message || 'خطأ في التحميل'
    } finally {
      if (epoch === sessionGeneration()) loading.value = false
    }
  }

  async function fetchAllPersistent() {
    const epoch = sessionGeneration()
    if (!authStore.isAuthenticated) {
      reset()
      return
    }
    try {
      const data = await notificationService.getNotificationsPersistent({ limit: 100 })
      notifications.value = data?.items || []
      unreadCount.value = data?.meta?.unread_count ?? 0
    } catch (e) {
      if (epoch !== sessionGeneration()) return
      if (import.meta.env.DEV) reportError('notifications', e)
      await fetchAll()
    }
  }

  async function fetchNotifications() {
    return fetchAll()
  }

  function startPolling(intervalMs = 30000) {
    if (pollingTimer !== null) return
    if (!authStore.isAuthenticated) return
    fetchAllPersistent()
    pollingTimer = setInterval(fetchAllPersistent, intervalMs)
  }

  function stopPolling() {
    clearInterval(pollingTimer)
    pollingTimer = null
  }

  // This store owns the reaction to auth changes. Previously `auth.js`
  // reached into this store on logout; now the direction is one-way:
  // notifications -> auth, and the watch handles stopPolling + reset.
  watch(() => authStore.user?.id, (authenticated) => {
    if (authenticated) {
      startPolling(30000)
    } else {
      stopPolling()
      reset()
    }
  }, { flush: 'sync' })

  async function markRead(id) {
    await notificationService.markRead(id)
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx > -1 && !notifications.value[idx].is_read) {
      notifications.value[idx].is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllRead() {
    await notificationService.markAllRead()
    notifications.value.forEach(n => n.is_read = true)
    unreadCount.value = 0
  }

  async function deleteNotification(id) {
    const notification = notifications.value.find(n => n.id === id)
    await notificationService.delete(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    if (notification && !notification.is_read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    reset,
    fetchAll,
    fetchAllPersistent,
    fetchNotifications,
    startPolling,
    stopPolling,
    markRead,
    markAllRead,
    deleteNotification,
  }
})
