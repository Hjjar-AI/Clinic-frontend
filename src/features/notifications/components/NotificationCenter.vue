<template>
  <div
    ref="triggerRef"
    class="notification-center"
  >
    <BaseButton
      variant="ghost"
      class="navbar__link notification-wrapper"
      aria-label="الإشعارات"
      @click="toggle"
    >
      <Icon icon="bell" />
      <Badge
        v-if="unreadCount"
        :value="unreadCount"
        severity="danger"
        size="xs"
        :class="{ 'notification-badge--new': hasNew }"
      />
    </BaseButton>

    <div
      v-if="open"
      ref="panelRef"
      class="notification-center__dropdown"
      :style="positionStyle"
      @click.stop
    >
      <div class="notification-center__header">
        <h3>الإشعارات</h3>
        <div class="flex gap-2">
          <BaseButton
            variant="ghost"
            size="xs"
            to="/notifications"
            @click="close"
          >
            عرض الكل
          </BaseButton>
          <BaseButton
            v-if="unreadCount"
            variant="ghost"
            size="sm"
            @click="notificationStore.markAllRead"
          >
            قراءة الكل
          </BaseButton>
        </div>
      </div>
      <div class="notification-center__list">
        <template
          v-for="(group, index) in groupedNotifications"
          :key="index"
        >
          <div class="notification-group-header">
            {{ group.label }}
          </div>
          <div
            v-for="n in group.notifications"
            :key="n.id"
            class="notification-center__item"
            :class="{ 'notification-center__item--unread': !n.is_read }"
          >
            <div
              class="notification-center__icon"
              :class="`notification-center__icon--${n.type || 'info'}`"
            >
              <Icon :icon="iconForType(n.type)" />
            </div>
            <div class="notification-center__content">
              <div class="notification-center__item-title">
                {{ n.title }}
              </div>
              <div class="notification-center__item-message">
                {{ n.message }}
              </div>
              <div class="notification-center__item-time">
                <RelativeDate :date="n.created_at" />
              </div>
            </div>
            <div class="notification-center__item-actions">
              <BaseButton
                v-if="!n.is_read"
                variant="primary"
                size="xs"
                @click="notificationStore.markRead(n.id)"
              >
                قراءة
              </BaseButton>
              <BaseButton
                variant="danger"
                size="xs"
                icon="trash"
                aria-label="حذف الإشعار"
                title="حذف الإشعار"
                @click="notificationStore.deleteNotification(n.id)"
              />
            </div>
          </div>
        </template>
        <EmptyState
          v-if="!notificationStore.notifications.length"
          type="default"
          title="لا توجد إشعارات"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'
import RelativeDate from '@/components/ui/RelativeDate.vue'
import { useDate } from '@/composables/useDate'
import { useDropdown } from '@/composables/useDropdown'
import { useUnreadCount } from '@/composables/useUnreadCount'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useNotificationStore } from '@/features/notifications/stores/notifications'

const notificationStore = useNotificationStore()
const { unreadCount } = useUnreadCount(180000)
const authStore = useAuthStore()
const hasNew = ref(false)
const { triggerRef, panelRef, open, positionStyle, toggle, close, observeTrigger } = useDropdown()
const { toISODate } = useDate()

watch(() => authStore.isAuthenticated, (authenticated) => {
  if (!authenticated) {
    close()
    notificationStore.stopPolling()
  }
})

watch(() => unreadCount.value, (newVal, oldVal) => {
  if (newVal > oldVal) {
    hasNew.value = true
    setTimeout(() => { hasNew.value = false }, 600)
  }
})

onMounted(() => {
  notificationStore.fetchNotifications()
  observeTrigger()
  notificationStore.startPolling(180000)
})
onBeforeUnmount(() => notificationStore.stopPolling())

const iconForType = (type) => ({
  info: 'info-circle',
  success: 'check-circle',
  danger: 'exclamation-circle',
  warning: 'exclamation-triangle'
}[type] || 'bell')

const groupedNotifications = computed(() => {
  const list = notificationStore.notifications
  if (!list.length) return []

  const todayIso = toISODate(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayIso = toISODate(yesterday)
  const startOfWeek = new Date()
  const day = startOfWeek.getDay()
  const diff = (day === 0 ? 6 : day - 1)
  startOfWeek.setDate(startOfWeek.getDate() - diff)
  startOfWeek.setHours(0,0,0,0)

  const groups = {
    today: { label: 'اليوم', notifications: [] },
    yesterday: { label: 'أمس', notifications: [] },
    thisWeek: { label: 'هذا الأسبوع', notifications: [] },
    older: { label: 'أقدم', notifications: [] }
  }

  list.forEach(n => {
    const dateIso = toISODate(new Date(n.created_at))
    if (dateIso === todayIso) {
      groups.today.notifications.push(n)
    } else if (dateIso === yesterdayIso) {
      groups.yesterday.notifications.push(n)
    } else {
      const notifDate = new Date(n.created_at)
      if (notifDate >= startOfWeek) {
        groups.thisWeek.notifications.push(n)
      } else {
        groups.older.notifications.push(n)
      }
    }
  })

  return Object.values(groups).filter(g => g.notifications.length)
})
</script>

<style scoped src="../../../styles/features/notifications/components/notification-center.css"></style>
