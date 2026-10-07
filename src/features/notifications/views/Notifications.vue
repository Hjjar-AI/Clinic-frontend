<template>
  <PageHeader
    title="الإشعارات"
    subtitle="آخر التحديثات والتنبيهات الخاصة بك."
  />
  <BaseCard>
    <div class="card__body">
      <div v-if="notificationStore.notifications.length">
        <div
          v-for="n in notificationStore.notifications"
          :key="n.id"
          class="flex flex--justify-between flex--center p-3 border-bottom"
          :class="{ 'bg-surface-soft': !n.is_read }"
        >
          <button
            type="button"
            class="notification-content text-right"
            :class="{ 'notification-content--linked': safeLink(n.link) }"
            @click="openNotification(n)"
          >
            <div class="font-semibold">
              {{ n.title }}
            </div>
            <div class="text-sm text-muted">
              {{ n.message }}
            </div>
            <div class="text-xs text-light">
              <RelativeDate :date="n.created_at" />
            </div>
          </button>
          <div class="flex flex--gap-1">
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
              @click="notificationStore.deleteNotification(n.id)"
            />
          </div>
        </div>
      </div>
      <EmptyState
        v-else
        title="لا توجد إشعارات"
        description="جميع الإشعارات مقروءة"
      />
    </div>
  </BaseCard>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import RelativeDate from '@/components/ui/RelativeDate.vue'
import { useNotificationStore } from '@/features/notifications/stores/notifications'

const notificationStore = useNotificationStore()
const router = useRouter()

function safeLink(link) {
  return typeof link === 'string' && link.startsWith('/') && !link.startsWith('//')
    ? link
    : ''
}

async function openNotification(notification) {
  if (!notification.is_read) await notificationStore.markRead(notification.id)
  const link = safeLink(notification.link)
  if (link) await router.push(link)
}

onMounted(() => notificationStore.fetchNotifications())
</script>

<style scoped>
.notification-content {
  appearance: none;
  background: none;
  border: 0;
  color: inherit;
  cursor: default;
  flex: 1;
  font: inherit;
  padding: 0;
}
.notification-content--linked { cursor: pointer; }
</style>
