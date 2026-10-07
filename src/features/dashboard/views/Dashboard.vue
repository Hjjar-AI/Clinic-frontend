<!-- frontend/src/features/dashboard/views/Dashboard.vue -->
<template>
  <DashboardLayout
    :greeting="dynamicGreeting"
    :can-edit-visit="authStore.can('edit_visit')"
    :marking="marking"
    :loading="analyticsStore.loading"
    :last-updated="refreshStore.lastUpdated"
    :kpi-items="kpiItems"
    :recent-patients="recentPatients"
    :high-risk-patients="highRiskPatients"
    :today-appointments="todayAppointments"
    :pending-tasks="pendingTasksList"
    @refresh="refreshAll"
    @mark-all-overdue="markAllOverdue"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'

import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useFormatters } from '@/composables/useFormatters'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/features/auth/stores/auth'
import DashboardLayout from '@/features/dashboard/components/DashboardLayout.vue'
import { useAnalyticsStore } from '@/features/dashboard/stores/analytics'
import { useRefreshStore } from '@/stores/refresh'
import { CONFIRM } from '@/utils/confirmMessages'

const analyticsStore = useAnalyticsStore()
const authStore = useAuthStore()
const { toArabicNumerals: toArabic } = useFormatters()
const { confirm } = useConfirmDialog()
const { notify } = useNotify()
const refreshStore = useRefreshStore()

const recentPatients = computed(() => analyticsStore.dashboard.recent_patients || [])
const highRiskPatients = computed(() => analyticsStore.dashboard.high_risk_patients || [])
const todayAppointments = computed(() => analyticsStore.dashboard.today_appointments || [])
const pendingTasksList = computed(() => analyticsStore.dashboard.pending_tasks || [])
const totalPatients = computed(() => analyticsStore.dashboard.total_patients || 0)
const totalVisits = computed(() => analyticsStore.dashboard.total_visits || 0)
const appointmentsToday = computed(() => analyticsStore.dashboard.appointments_today || 0)
const pendingTasks = computed(() => analyticsStore.dashboard.pending_tasks_count || 0)

const kpiItems = computed(() => [
  { icon: 'users', label: 'إجمالي المرضى', value: toArabic(totalPatients.value), type: 'patients' },
  { icon: 'notes-medical', label: 'مجموع الزيارات', value: toArabic(totalVisits.value), type: 'visits' },
  { icon: 'calendar-check', label: 'جلسات اليوم', value: toArabic(appointmentsToday.value), type: 'appointments' },
  { icon: 'tasks', label: 'المهام المعلقة', value: toArabic(pendingTasks.value), type: 'tasks' },
])

const dynamicGreeting = computed(() => {
  const hour = new Date().getHours()
  const greeting = hour >= 5 && hour < 12 ? 'صباح الخير' : 'مساء الخير'
  const name = authStore.user?.full_name || 'دكتور'
  return `👋 ${greeting}، ${name}`
})

const marking = computed(() => analyticsStore.loading)

async function refreshAll() {
  try {
    await analyticsStore.fetchDashboard()
    refreshStore.touch()
    notify('تم تحديث لوحة التحكم', 'success')
  } catch {
    notify('فشل التحديث', 'danger')
  }
}

async function markAllOverdue() {
  const ok = await confirm(CONFIRM.MARK_ALL_OVERDUE)
  if (ok) {
    try {
      await analyticsStore.markAllOverdue()
      notify('تم تسجيل المتابعات المتأخرة كفائتة', 'success')
      await refreshAll()
    } catch {
      notify('فشلت العملية', 'danger')
    }
  }
}

onMounted(async () => { await refreshAll() })
</script>
