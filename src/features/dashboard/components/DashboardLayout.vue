<template>
  <div class="dashboard-content">
    <PageHeader
      :title="greeting"
      subtitle="لوحة التحكم"
    >
      <template #actions>
        <BaseButton
          v-if="canEditVisit"
          variant="warning"
          size="sm"
          :loading="marking"
          @click="$emit('mark-all-overdue')"
        >
          <Icon icon="check-double" /> تسجيل المتابعات المتأخرة كفائتة
        </BaseButton>
        <RelativeDate
          v-if="lastUpdated"
          :date="lastUpdated"
          icon="clock"
          label="آخر تحديث:"
        >
          <template #actions>
            <BaseButton
              variant="ghost"
              size="xs"
              @click="$emit('refresh')"
            >
              <Icon icon="sync" />
            </BaseButton>
          </template>
        </RelativeDate>
      </template>
    </PageHeader>

    <KpiGrid
      :items="kpiItems"
      :cols="4"
    />

    <div class="grid-2 mb-4">
      <BaseCard
        header-title="أحدث السجلات"
        header-icon="clock"
        :loading="loading"
        :empty="!loading && !recentPatients.length"
        empty-type="patients"
        empty-title="لا توجد سجلات حديثة"
      >
        <div class="flex flex--wrap gap-2">
          <router-link
            v-for="p in recentPatients"
            :key="p.id"
            :to="{ name: 'PatientDetail', params: { id: p.id } }"
            class="tag tag--info-soft"
          >
            <Avatar
              size="xs"
              color="primary"
            /> {{ fullName(p) }}
          </router-link>
        </div>
      </BaseCard>

      <BaseCard
        header-title="تنبيهات المخاطر"
        header-icon="exclamation-triangle"
        header-variant="danger"
        :loading="loading"
        :empty="!loading && !highRiskPatients.length"
        empty-type="default"
        empty-title="لا توجد تنبيهات"
      >
        <ul class="list-unstyled">
          <li
            v-for="p in highRiskPatients"
            :key="p.id"
            class="flex flex--justify-between flex--center p-2 border-bottom"
          >
            <router-link
              :to="{ name: 'PatientDetail', params: { id: p.id } }"
              class="text-danger font-semibold"
            >
              <Avatar
                size="xs"
                color="danger"
              /> {{ fullName(p) }}
            </router-link>
            <Badge
              :status="getPatientRiskLevel(p)"
              status-type="risk"
              variant="soft"
              size="xs"
            />
          </li>
        </ul>
      </BaseCard>
    </div>

    <div class="grid-2 mb-4">
      <BaseCard
        header-title="مراجعو اليوم"
        header-icon="calendar-day"
        :loading="loading"
        :empty="!loading && !todayAppointments.length"
        empty-type="appointments"
        empty-title="لا توجد مواعيد"
      >
        <div
          v-for="apt in todayAppointments"
          :key="apt.id"
          class="flex flex--justify-between flex--center p-2 border-bottom"
        >
          <div><span class="font-bold text-primary ml-3">{{ apt.appointment_time }}</span> {{ apt.patient_name }}</div>
          <Badge
            :status="apt.status"
            status-type="appointment"
            variant="soft"
            size="xs"
          />
        </div>
      </BaseCard>

      <BaseCard
        header-title="مهام إدارية"
        header-icon="tasks"
        :loading="loading"
        :empty="!loading && !pendingTasks.length"
        empty-type="tasks"
        empty-title="كل المهام منجزة"
      >
        <div
          v-for="task in pendingTasks"
          :key="task.id"
          class="p-2 border-bottom text-sm"
        >
          <Icon icon="tasks" /> {{ task.title }}
        </div>
      </BaseCard>
    </div>

    <EditableNotes :user-id="authStore.user?.id" />
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
import { useAuthStore } from '@/features/auth/stores/auth'

const authStore = useAuthStore()

defineProps({
  greeting: { type: String, required: true },
  canEditVisit: { type: Boolean, default: false },
  marking: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: null },
  kpiItems: { type: Array, required: true },
  recentPatients: { type: Array, required: true },
  highRiskPatients: { type: Array, required: true },
  todayAppointments: { type: Array, required: true },
  pendingTasks: { type: Array, required: true },
})

defineEmits(['refresh', 'mark-all-overdue'])

function fullName(p) {
  return p.first_name ? `${p.first_name} ${p.surname || ''}`.trim() : 'غير معروف'
}

function getPatientRiskLevel(patient) {
  const visit = patient.latest_visit || patient
  if (visit.suicide_risk_level === 'High' || visit.violence_risk_level === 'High') return 'High'
  if (visit.suicide_risk_level === 'Moderate' || visit.violence_risk_level === 'Moderate') return 'Moderate'
  return 'Low'
}
</script>

<style scoped src="../../../styles/features/dashboard/components/dashboard-layout.css"></style>
