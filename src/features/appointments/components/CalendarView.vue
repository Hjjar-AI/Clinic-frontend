<template>
  <DayViewGrid
    v-if="view === 'day'"
    :current-date-str="currentDateStr"
    :time-slots="timeSlots"
    :appointments="appointments"
    :loading="loading"
    :can-manage="canManage"
    @drop-slot="$emit('drop-slot', $event)"
  />
  <WeekViewGrid
    v-else-if="view === 'week'"
    :weekly-view-data="weeklyViewData"
    :can-manage="canManage"
    @drop-week="$emit('drop-week', $event)"
    @day-click="$emit('day-click', $event)"
  />
  <MonthViewGrid
    v-else
    :appointments="monthAppointments"
    :month-name="monthName"
    :year="year"
    :month-index="monthIndex"
    @day-click="$emit('day-click', $event)"
  />
</template>

<script setup>
import DayViewGrid from '@/features/appointments/components/DayViewGrid.vue'
import MonthViewGrid from '@/features/appointments/components/MonthViewGrid.vue'
import WeekViewGrid from '@/features/appointments/components/WeekViewGrid.vue'

defineProps({
  view:              { type: String, required: true },
  currentDateStr:    String,
  timeSlots:         Array,
  appointments:      Array,
  loading:           Boolean,
  weeklyViewData:    Array,
  monthAppointments: Array,
  monthName:         String,
  year:              Number,
  monthIndex:        Number,
  canManage:         { type: Boolean, default: false },
})

defineEmits(['drop-slot', 'drop-week', 'day-click'])
</script>
