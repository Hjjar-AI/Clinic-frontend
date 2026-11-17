<template>
  <PageHeader
    title="الإشعارات"
    subtitle="آخر التحديثات والتنبيهات الخاصة بك."
  />
  <BaseCard>
    <div class="card__body">
      <BaseButton :loading="clearing" @click="clearRead">حذف الإشعارات المقروءة</BaseButton>
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
          <div class="flex gap-1">
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
import { onMounted, ref } from 'vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useRouter } from 'vue-router'

import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import RelativeDate from '@/components/ui/RelativeDate.vue'
import { useNotificationStore } from '@/features/notifications/stores/notifications'

const notificationStore = useNotificationStore()
const router = useRouter()
const clearing = ref(false)
const { confirm } = useConfirmDialog()
async function clearRead() {
  if (clearing.value || !await confirm('حذف جميع إشعاراتك المقروءة؟')) return
  clearing.value = true
  try { await notificationStore.deleteAllRead() } catch { /* Shared API feedback. */ }
  finally { clearing.value = false }
}

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

<style scoped src="../../../styles/features/notifications/views/notifications.css"></style>
