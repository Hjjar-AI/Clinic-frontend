import { computed } from 'vue'
import { useNotificationStore } from '@/features/notifications/stores/notifications'

// NotificationStore owns polling; all badges reflect its mutations immediately.
export function useUnreadCount() {
  const store = useNotificationStore()
  return { unreadCount: computed(() => store.unreadCount), refresh: () => store.fetchAllPersistent() }
}
