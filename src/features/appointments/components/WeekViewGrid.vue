<!-- frontend/src/components/appointment/WeekViewGrid.vue -->
<template>
  <div class="calendar-weeks-grid grid-1 gap-3">
    <BaseCard
      v-for="day in weeklyViewData"
      :key="day.date"
      class="card--interactive list-item-hover"
      :class="{ 'weekend-card': day.isWeekend, 'cal-today-card': day.isToday }"
      role="region"
      :aria-label="day.weekday + ' ' + day.date"
      tabindex="0"
      @dragover.prevent="canManage"
      @drop="onDrop($event, day.date)"
      @keydown.enter.prevent="$emit('day-click', day.date)"
      @keydown.space.prevent="$emit('day-click', day.date)"
    >
      <template #header>
        <BaseButton
          class="card__header py-2 px-3 flex-grid flex-grid--justify-between card__header--light"
          :class="{ 'cal-today-header': day.isToday }"
          variant="ghost"
          @click="$emit('day-click', day.date)"
        >
          <span class="font-bold text-secondary">{{ day.weekday }}</span>
          <Badge type="grey">
            {{ day.date }}
          </Badge>
        </BaseButton>
      </template>
      <div class="card__body p-3">
        <div
          v-if="day.appointments && day.appointments.length"
          class="flex-grid flex-grid--column gap-2"
        >
          <AppointmentBlock
            v-for="apt in day.appointments"
            :key="apt.id"
            :appointment="apt"
            :can-manage="canManage"
            @edit="$emit('day-click', day.date)"
          />
        </div>
        <EmptyState
          v-else
          type="appointments"
          title="لا توجد أي مواعيد في هذا اليوم"
        />
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import AppointmentBlock from '@/features/appointments/components/AppointmentBlock.vue'

const props = defineProps({
  weeklyViewData: { type: Array, required: true },
  canManage: { type: Boolean, default: false },
})
const emit = defineEmits(['drop-week', 'day-click'])

function onDrop(event, date) {
  event.preventDefault()
  if (!props.canManage) return
  try {
    const raw = event.dataTransfer.getData('text/plain')
    if (!raw) return
    const data = JSON.parse(raw)
    if (data && data.id) {
      emit('drop-week', data.id, date, data.appointment_time)
    }
  } catch { /* ignore non‑appointment drags */ }
}
</script>
