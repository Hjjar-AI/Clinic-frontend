// frontend/src/composables/useUnreadCount.js
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useAuthStore } from '@/features/auth/stores/auth'
import { useNotificationStore } from '@/features/notifications/stores/notifications'

export function useUnreadCount(pollInterval = 60000) {
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()
  const unreadCount = ref(0)
  let intervalId = null

  async function refresh() {
    if (!authStore.isAuthenticated) {
      unreadCount.value = 0
      return
    }
    try {
      // Try persistent fetch; if it fails, fall back to regular fetch
      try {
        await notificationStore.fetchAllPersistent()
      } catch {
        await notificationStore.fetchAll()
      }
      unreadCount.value = notificationStore.unreadCount
    } catch { /* ignore */ }
  }

  function startPolling() {
    stopPolling()
    if (!authStore.isAuthenticated) return
    intervalId = setInterval(refresh, pollInterval)
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  watch(() => authStore.isAuthenticated, (val) => {
    if (val) startPolling()
    else {
      stopPolling()
      unreadCount.value = 0
    }
  })

  onMounted(() => {
    if (authStore.isAuthenticated) {
      refresh()
      startPolling()
    }
  })

  onBeforeUnmount(() => {
    stopPolling()
  })

  return { unreadCount, refresh }
}