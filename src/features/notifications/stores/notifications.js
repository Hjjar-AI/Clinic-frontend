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

  async function fetchAll() {
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
      error.value = e.message || 'خطأ في التحميل'
    } finally {
      loading.value = false
    }
  }

  async function fetchAllPersistent() {
    if (!authStore.isAuthenticated) {
      reset()
      return
    }
    try {
      const data = await notificationService.getNotificationsPersistent({ limit: 100 })
      notifications.value = data?.items || []
      unreadCount.value = data?.meta?.unread_count ?? 0
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Persistent notification fetch failed, falling back', e)
      await fetchAll()
    }
  }

  async function fetchNotifications() {
    return fetchAll()
  }

  function startPolling(intervalMs = 30000) {
    stopPolling()
    if (!authStore.isAuthenticated) return
    fetchAll()
    pollingTimer = setInterval(fetchAllPersistent, intervalMs)
  }

  function stopPolling() {
    clearInterval(pollingTimer)
    pollingTimer = null
  }

  // This store owns the reaction to auth changes. Previously `auth.js`
  // reached into this store on logout; now the direction is one-way:
  // notifications -> auth, and the watch handles stopPolling + reset.
  watch(() => authStore.isAuthenticated, (authenticated) => {
    if (authenticated) {
      startPolling(30000)
    } else {
      stopPolling()
      reset()
    }
  })

  async function markRead(id) {
    await notificationService.markRead(id)
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx > -1) {
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
