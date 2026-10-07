<!-- frontend/src/features/appointments/views/AppointmentsCalendar.vue -->
<template>
  <CalendarLayout
    :view="view"
    :can-manage-users="authStore.can('manage_users')"
    :can-manage-appointments="authStore.can('manage_appointments')"
    :filters="filters"
    :doctor-filter-fields="doctorFilterFields"
    :period-label="periodLabel"
    :loading="loading"
    :appointments="appointments"
    :current-date-str="currentDateStr"
    :time-slots="timeSlots"
    :weekly-view-data="weeklyViewData"
    :month-appointments="monthAppointments"
    :month-name="currentMonthName"
    :year="currentYear"
    :month-index="currentDate.getMonth()"
    @view-change="view = $event; loadAppointments()"
    @update:filters="filters = $event"
    @filter-apply="loadAppointments()"
    @filter-reset="confirmResetFilters"
    @navigate="navigate"
    @drop-slot="handleDropSlot"
    @drop-week="handleDropWeek"
    @day-click="goToDay"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useDate } from '@/composables/useDate'
import { useNotify } from '@/composables/useNotify'
import { useRouteQuery } from '@/composables/useRouteQuery'
import CalendarLayout from '@/features/appointments/components/CalendarLayout.vue'
import { useCalendar } from '@/features/appointments/composables/useCalendar'
import { useTimeSlots } from '@/features/appointments/composables/useTimeSlots'
import { useAppointmentStore } from '@/features/appointments/stores/appointments'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useUserStore } from '@/features/settings/stores/users'
import { useRefreshStore } from '@/stores/refresh'
import { debounce } from '@/utils'
import { CONFIRM } from '@/utils/confirmMessages'

const { view, currentDate, loading, weeklyViewData, appointments, fetchAppointments } = useCalendar()
const { timeSlots } = useTimeSlots()
const authStore = useAuthStore()
const userStore = useUserStore()
const appointmentStore = useAppointmentStore()
const { confirm } = useConfirmDialog()
const { formatDate, toISODate, parseDate } = useDate()
const { notify } = useNotify()
const refreshStore = useRefreshStore()

const routeView = useRouteQuery('view', 'day')
const routeDate = useRouteQuery('date', toISODate(new Date()))

const selectedDoctorId = ref(null)
const filters = ref({ doctor_id: '' })
const doctorFilterFields = computed(() => [
  { key: 'doctor_id', type: 'select', placeholder: 'جميع الأطباء',
    options: [{ value: '', label: 'جميع الأطباء' }, ...userStore.doctors.map(d => ({ value: d.id, label: d.full_name }))]
  }
])

const currentDateStr = computed(() => toISODate(currentDate.value))
const currentMonthName = computed(() => ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][currentDate.value.getMonth()])
const currentYear = computed(() => currentDate.value.getFullYear())
const monthAppointments = computed(() => {
  const year = currentYear.value; const month = currentDate.value.getMonth()
  return (appointments.value || []).filter(a => {
    if (!a.appointment_date) return false
    const dateStr = a.appointment_date
    const y = parseInt(dateStr.substring(0,4))
    const m = parseInt(dateStr.substring(5,7)) - 1
    return y === year && m === month
  })
})
const periodLabel = computed(() => {
  if (view.value === 'day') return formatDate(currentDate.value)
  if (view.value === 'week') { const start = new Date(currentDate.value); start.setDate(start.getDate() - start.getDay()); const end = new Date(start); end.setDate(end.getDate() + 6); return `${formatDate(start)} – ${formatDate(end)}` }
  return `${currentMonthName.value} ${currentYear.value}`
})

onMounted(async () => {
  if (routeView.value) view.value = routeView.value
  if (routeDate.value) { const d = parseDate(routeDate.value); if (d) currentDate.value = d }
  await userStore.fetchDoctors()
  window.addEventListener('resize', handleResize)
  await loadAppointments()
})

onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

watch(view, (v) => { routeView.value = v })
watch(currentDate, (d) => { routeDate.value = toISODate(d) })

function getDateRange() {
  const start = new Date(currentDate.value)
  if (view.value === 'day') { const end = new Date(start); end.setDate(end.getDate()+1); return {start,end} }
  if (view.value === 'week') { const day = start.getDay(); start.setDate(start.getDate()-day); const end = new Date(start); end.setDate(end.getDate()+7); return {start,end} }
  start.setDate(1); const end = new Date(start); end.setMonth(end.getMonth()+1); return {start,end}
}

async function loadAppointments() {
  const {start,end} = getDateRange()
  const docId = filters.value.doctor_id || null
  selectedDoctorId.value = docId
  await fetchAppointments(start,end,docId)
  refreshStore.touch()
}

// Reassign a fresh Date so the ref identity changes. Mutating the Date in
// place (the old `setDate`/`setMonth` calls) did not trigger Vue's reactivity
// — `currentDate` is a plain ref holding a Date, and Vue 3 does not wrap Date
// objects in reactive proxies — so the period label, the month grid, and the
// URL query all stayed on the previous date even though `fetchAppointments`
// had already requested the new range.
function navigate(dir) {
  if (dir === 'today') {
    currentDate.value = new Date()
    loadAppointments()
    return
  }
  const d = new Date(currentDate.value)
  if (dir === 'prev') {
    if (view.value === 'day') d.setDate(d.getDate() - 1)
    else if (view.value === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
  } else if (dir === 'next') {
    if (view.value === 'day') d.setDate(d.getDate() + 1)
    else if (view.value === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
  }
  currentDate.value = d
  loadAppointments()
}

function goToDay(dateStr) { view.value = 'day'; currentDate.value = new Date(dateStr+'T00:00:00'); loadAppointments() }

// Look up the appointment's current version from the local list so the
// reschedule endpoint can perform optimistic-lock validation.
function findVersion(id) {
  const apt = (appointments.value || []).find(a => a.id === id)
  return apt ? apt.version : undefined
}

// After a successful reschedule, force a re-fetch so the view reflects the
// new position. `appointmentStore.rescheduleAppointment` mutates the store's
// own `items` array, but this view renders from `useCalendar()`'s
// `appointments` shallowRef — two separate arrays. Without the refresh, a
// dragged appointment stayed visually in its old slot until the next
// natural reload.
async function handleDropSlot(id, date, time) {
  if (!authStore.can('manage_appointments')) return
  try {
    await appointmentStore.rescheduleAppointment(id, date, time, findVersion(id))
    await loadAppointments()
    notify('تم نقل الموعد', 'success')
  } catch {
    notify('فشل النقل', 'danger')
  }
}

async function handleDropWeek(id, date, time) {
  if (!authStore.can('manage_appointments')) return
  try {
    await appointmentStore.rescheduleAppointment(id, date, time, findVersion(id))
    await loadAppointments()
    notify('تم نقل الموعد', 'success')
  } catch {
    notify('فشل النقل', 'danger')
  }
}

async function confirmResetFilters() {
  const ok = await confirm(CONFIRM.CLEAR_FILTERS)
  if (ok) { filters.value = { doctor_id: '' }; loadAppointments() }
}

const handleResize = debounce(() => { if (window.innerWidth < 768 && view.value !== 'day') view.value = 'day' }, 250)
</script>
