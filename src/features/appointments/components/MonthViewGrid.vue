<!-- frontend/src/components/appointment/MonthViewGrid.vue -->
<template>
  <div class="card">
    <div class="card__header">
      <h3 class="heading-5 m-0">
        {{ monthName }} {{ year }}
      </h3>
    </div>
    <div class="card__body">
      <div class="month-grid-header">
        <div
          v-for="day in dayHeaders"
          :key="day"
          class="month-grid-header__cell"
        >
          {{ day }}
        </div>
      </div>

      <div class="month-grid">
        <div
          v-for="(week, wi) in calendarWeeks"
          :key="wi"
          class="month-grid__week"
        >
          <Tooltip
            v-for="(day, di) in week"
            :key="`${wi}-${di}-${day.date || ''}`"
            position="top"
          >
            <template #trigger>
              <button
                class="month-grid__day"
                :class="{
                  'month-grid__day--today': day.isToday,
                  'month-grid__day--other-month': day.isOtherMonth,
                  'month-grid__day--weekend': day.isWeekend
                }"
                type="button"
                :aria-label="day.date ? day.date : ''"
                @click="day.date && $emit('day-click', day.date)"
              >
                <span class="month-grid__day-number">{{ day.dayNumber || '' }}</span>
                <div
                  v-if="day.appts && day.appts.length"
                  class="month-grid__dots"
                >
                  <span
                    v-for="apt in day.appts.slice(0, 3)"
                    :key="apt.id"
                    class="month-grid__dot"
                    :class="`month-grid__dot--${apt.status}`"
                  />
                  <span
                    v-if="day.appts.length > 3"
                    class="month-grid__more"
                  >
                    +{{ day.appts.length - 3 }}
                  </span>
                </div>
              </button>
            </template>
            <div
              v-if="day.appts && day.appts.length"
              class="text-sm"
            >
              <div
                v-for="apt in day.appts"
                :key="apt.id"
                class="mb-1"
              >
                <strong>{{ apt.appointment_time }}</strong> – {{ apt.patient_name }}
              </div>
            </div>
            <div
              v-else
              class="text-sm"
            >
              لا توجد مواعيد
            </div>
          </Tooltip>
        </div>
      </div>

      <CalendarLegend v-if="hasAppointments" />
    </div>
  </div>
</template>

<script setup>
import { computed, shallowRef, watch } from 'vue'

import Tooltip from '@/components/ui/Tooltip.vue'
import { useDate } from '@/composables/useDate'
import CalendarLegend from '@/features/appointments/components/CalendarLegend.vue'

const { toISODate } = useDate()

const props = defineProps({
  appointments: { type: Array, default: () => [] },
  monthName: { type: String, required: true },
  year: { type: Number, required: true },
  monthIndex: { type: Number, required: true },
})

defineEmits(['day-click'])

const dayHeaders = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
const hasAppointments = computed(() => props.appointments && props.appointments.length > 0)
const calendarWeeks = shallowRef([])
const todayDateString = toISODate(new Date())

function buildCalendarWeeks() {
  const y = props.year
  const m = props.monthIndex
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prevMonthDays = new Date(y, m, 0).getDate()
  const today = todayDateString

  const apptsByDate = {}
  const list = props.appointments || []
  for (const a of list) {
    const d = a.appointment_date
    if (!apptsByDate[d]) apptsByDate[d] = []
    apptsByDate[d].push(a)
  }

  const weeks = []
  let lead = firstDay === 0 ? 6 : firstDay - 1
  let startDay = prevMonthDays - lead + 1

  let currentWeek = []
  for (let i = 0; i < lead; i++) {
    const date = new Date(y, m - 1, startDay + i)
    const dateStr = toISODate(date)
    currentWeek.push({
      dayNumber: startDay + i,
      date: dateStr,
      isToday: dateStr === today,
      isOtherMonth: true,
      isWeekend: date.getDay() === 5 || date.getDay() === 6,
      appts: apptsByDate[dateStr] || [],
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d)
    const dateStr = toISODate(date)
    currentWeek.push({
      dayNumber: d,
      date: dateStr,
      isToday: dateStr === today,
      isOtherMonth: false,
      isWeekend: date.getDay() === 5 || date.getDay() === 6,
      appts: apptsByDate[dateStr] || [],
    })

    if (currentWeek.length % 7 === 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    let nextDay = 1
    while (currentWeek.length < 7) {
      const date = new Date(y, m + 1, nextDay)
      const dateStr = toISODate(date)
      currentWeek.push({
        dayNumber: nextDay,
        date: dateStr,
        isToday: dateStr === today,
        isOtherMonth: true,
        isWeekend: date.getDay() === 5 || date.getDay() === 6,
        appts: apptsByDate[dateStr] || [],
      })
      nextDay++
    }
    weeks.push(currentWeek)
  }

  calendarWeeks.value = weeks
}

watch(
  () => [props.year, props.monthIndex, props.appointments],
  () => {
    buildCalendarWeeks()
  },
  { immediate: true }
)
</script>