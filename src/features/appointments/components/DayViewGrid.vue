<!-- frontend/src/components/appointment/DayViewGrid.vue -->
<template>
  <div class="calendar-day-view">
    <div class="card">
      <div
        class="card__header card__header--neutral"
        :class="{ 'cal-today-header': isToday }"
      >
        <h3 class="heading-5 m-0">
          {{ currentDateStr }}
        </h3>
      </div>
      <div
        class="card__body p-0 position-relative"

      >
        <div
          v-if="!loading"
          class="day-appointments-list"
        >
          <div
            v-for="slot in displaySlots"
            :key="slot"
            class="day-slot p-3 border-bottom flex flex--justify-between flex--center"
            :style="{ minHeight: slotHeight + 'px' }"
            @dragover.prevent="canManage"
            @drop="onDrop($event, slot)"
          >
            <span class="font-bold text-primary">{{ slot }}</span>
            <div
              v-if="appointmentsForSlot(slot).length"
              class="flex gap-2 flex--center day-slot__appointment"
            >
              <AppointmentBlock
                v-for="appointment in appointmentsForSlot(slot)"
                :key="appointment.id"
                :appointment="appointment"
                :can-manage="canManage"
                @edit="editAppointment(appointment.id)"
              />
            </div>
            <SlotToken
              v-else-if="canManage"
              state="available"
              @click="newAppointment(slot)"
            >
              + متاح
            </SlotToken>
          </div>
          <div
            v-if="showTimeIndicator"
            class="current-time-line"
            :style="{ top: currentTimeTop + 'px' }"
          />
        </div>
        <div
          v-else
          class="skeleton-day-grid"
        >
          <div
            v-for="i in 12"
            :key="i"
            class="skeleton-slot"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed,ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAutoCleanup } from '@/composables/useAutoCleanup'
import { useDate } from '@/composables/useDate'
import AppointmentBlock from '@/features/appointments/components/AppointmentBlock.vue'
import SlotToken from '@/features/appointments/components/SlotToken.vue'

const props = defineProps({
  currentDateStr: { type: String, required: true },
  timeSlots: { type: Array, required: true },
  appointments: { type: Array, default: () => [] },
  loading: Boolean,
  canManage: { type: Boolean, default: false },
})

const emit = defineEmits(['drop-slot'])
const router = useRouter()
const { toISODate } = useDate()
const { add } = useAutoCleanup()

const slotHeight = computed(() => {
  const vh = window.innerHeight
  return Math.max(44, Math.min(64, (vh - 200) / 15))
})

const now = ref(new Date())
const intervalId = setInterval(() => { now.value = new Date() }, 300000)
add(() => clearInterval(intervalId))

const isToday = computed(() => {
  return props.currentDateStr === toISODate(new Date())
})

const showTimeIndicator = computed(() => isToday.value)

const currentTimeTop = computed(() => {
  const minutes = now.value.getHours() * 60 + now.value.getMinutes()
  const startMinutes = clockMinutes(displaySlots.value[0])
  const endMinutes = clockMinutes(displaySlots.value.at(-1)) + 30
  if (minutes < startMinutes || minutes > endMinutes) return -10
  const totalRange = endMinutes - startMinutes
  const elapsed = minutes - startMinutes
  const totalHeight = displaySlots.value.length * slotHeight.value
  return (elapsed / totalRange) * totalHeight
})

function clockMinutes(clock) {
  const [hour, minute] = String(clock || '').split(':').map(Number)
  return hour * 60 + minute
}
const displaySlots = computed(() => {
  const base = props.timeSlots.map(clockMinutes).filter(Number.isFinite)
  if (!base.length) return []
  const step = base.length > 1 ? base[1] - base[0] : 30
  if (step <= 0) return props.timeSlots
  const bookings = props.appointments.filter(row => row.appointment_date === props.currentDateStr && Number.isFinite(clockMinutes(row.appointment_time)))
  const first = Math.min(base[0], ...bookings.map(row => Math.floor(clockMinutes(row.appointment_time) / step) * step))
  const last = Math.min(1439, Math.max(base.at(-1), ...bookings.map(row => Math.floor((clockMinutes(row.appointment_time) + (row.duration_minutes ?? 30) - 1) / step) * step)))
  const slots = []
  for (let minute = first; minute <= last; minute += step) slots.push(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`)
  return slots
})

function appointmentsForSlot(slot) {
  const minutes = clockMinutes
  const start = minutes(slot)
  const index = displaySlots.value.indexOf(slot)
  const end = index + 1 < displaySlots.value.length ? minutes(displaySlots.value[index + 1]) : start + 30
  return props.appointments.filter(appointment => {
    if (appointment.appointment_date !== props.currentDateStr) return false
    const time = minutes(appointment.appointment_time)
    return time < end && time + (appointment.duration_minutes ?? 30) > start
  })
}

function onDrop(event, time) {
  event.preventDefault()
  if (!props.canManage) return
  try {
    const raw = event.dataTransfer.getData('text/plain')
    if (!raw) return
    const data = JSON.parse(raw)
    if (data && data.id) emit('drop-slot', data.id, props.currentDateStr, time)
  } catch { /* ignore non‑appointment drags */ }
}

function editAppointment(id) { router.push({ name: 'AppointmentEdit', params: { id } }) }
function newAppointment(time) { router.push(`/appointments/new?date=${props.currentDateStr}&time=${time}`) }
</script>
