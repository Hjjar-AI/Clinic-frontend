<template>
  <div class="mini-calendar">
    <div class="flex flex--justify-between mb-2">
      <BaseButton
        variant="secondary"
        size="xs"
        aria-label="الشهر السابق"
        @click="prevMonth"
      >
        <Icon icon="chevron-right" />
      </BaseButton>
      <strong>{{ monthName }} {{ year }}</strong>
      <BaseButton
        variant="secondary"
        size="xs"
        aria-label="الشهر التالي"
        @click="nextMonth"
      >
        <Icon icon="chevron-left" />
      </BaseButton>
    </div>
    <div class="mini-calendar-grid">
      <div
        v-for="d in dayHeaders"
        :key="d"
        class="mini-calendar-day header"
      >
        {{ d }}
      </div>
      <div
        v-for="(day, idx) in calendarDays"
        :key="idx"
        class="mini-calendar-day"
        :class="{ 'today': day.isToday, 'has-appt': day.hasAppointment }"
      >
        <span v-if="day.day">{{ day.day }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed,ref } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({ appointments: { type: Array, default: () => [] } })
const currentDate = ref(new Date())
const dayHeaders = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت']
const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())
const monthName = computed(() => ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][month.value])
const calendarDays = computed(() => {
  const y = year.value, m = month.value
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m+1, 0).getDate()
  const today = new Date()
  const days = []
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  for (let i=0; i<startOffset; i++) days.push({ day: null })
  for (let d=1; d<=daysInMonth; d++) {
    const date = new Date(y, m, d)
    const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const hasAppt = props.appointments.some(a => a.date === dateStr)
    days.push({ day: d, isToday: date.toDateString() === today.toDateString(), hasAppointment: hasAppt })
  }
  return days
})
const prevMonth = () => { currentDate.value = new Date(year.value, month.value - 1, 1) }
const nextMonth = () => { currentDate.value = new Date(year.value, month.value + 1, 1) }
</script>