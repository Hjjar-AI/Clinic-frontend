<!-- frontend/src/components/dashboard/DashboardNextAppointment.vue -->
<template>
  <div
    v-if="nextAppointment"
    class="card p-3 mb-4 text-center"
  >
    <StatCard
      icon="calendar-check"
      :label="'الموعد التالي: ' + nextAppointment.time"
      :value="countdownText"
      type="appointments"
      :animate="false"
    />
  </div>
</template>

<script setup>
import StatCard from '@/components/ui/StatCard.vue'

defineProps({
  nextAppointment: { type: Object, default: null },
  countdownText: { type: String, default: '' }
})
</script>