<template>
  <section aria-label="الموعد القادم">
    <h3>الموعد القادم</h3>
    <ResourceFeedback :loading="loading" :error="error" retryable @retry="retry" />
    <p v-if="!loading && !error && !data?.id">لا يوجد موعد قادم متاح.</p>
    <p v-if="data?.id"><DateCell :date="data.date" :relative="false" /> · {{ data.time }}
      <BaseButton v-if="auth.can('manage_appointments')" :to="{ name: 'AppointmentEdit', params: { id: data.id } }">فتح الموعد</BaseButton>
      <BaseButton v-else :to="{ name: 'AppointmentsCalendar', query: { date: data.date } }">عرض المواعيد</BaseButton>
    </p>
  </section>
</template>
<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import DateCell from '@/components/ui/DateCell.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useLatestResource } from '@/composables/useLatestResource'
import { useAuthStore } from '@/features/auth/stores/auth'
import appointmentService from '@/features/appointments/services/appointmentService'
const props = defineProps({ patientId: { type: Number, required: true } })
const auth = useAuthStore()
const { data, loading, error, retry } = useLatestResource(() => props.patientId, id => appointmentService.next(id))
</script>
