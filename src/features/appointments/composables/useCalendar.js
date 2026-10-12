// frontend/src/features/appointments/composables/useCalendar.js
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import { useDate } from '@/composables/useDate'
import { useAuthStore } from '@/features/auth/stores/auth'
import apiClient from '@/services/apiClient'

export function useCalendar() {
  const view = ref('day')
  const currentDate = ref(new Date())
  const appointments = shallowRef([])
  const loading = ref(false)
  const error = ref('')
  let disposed = false
  const { toISODate } = useDate()
  const authStore = useAuthStore()

  let lastFetchParams = null
  let fetchController = null

  async function fetchAppointments(startDate, endDate, doctorId = null) {
    // Only fetch if authenticated
    if (!authStore.isAuthenticated) return

    fetchController?.abort()
    const controller = new AbortController()
    fetchController = controller
    loading.value = true
    error.value = ''
    appointments.value = []
    lastFetchParams = { start: startDate, end: endDate, doctorId }
    try {
      const rows = []
      let offset = 0, total = Infinity
      while (offset < total) {
        const params = { start_date: toISODate(startDate), end_date: toISODate(endDate), limit: 200, offset }
        if (doctorId) params.doctor_id = doctorId
        const response = await apiClient.get('/appointments/raw', { params, signal: controller.signal })
        if (disposed || controller !== fetchController) return false
        const inner = response.data?.data ?? response.data
        if (!Array.isArray(inner?.appointments)) throw new Error('استجابة مواعيد غير صالحة')
        rows.push(...inner.appointments)
        total = inner.meta?.total ?? rows.length
        if (!inner.appointments.length && rows.length < total) throw new Error('قائمة المواعيد غير مكتملة')
        offset += inner.appointments.length
      }
      appointments.value = rows
      return true
    } catch (failure) {
      if (!disposed && controller === fetchController && !apiClient.isCancel(failure)) error.value = 'تعذر تحميل المواعيد؛ أعد المحاولة'
      return false
    } finally {
      if (controller === fetchController) { loading.value = false; fetchController = null }
    }
  }

  let visibilityHandler = null

  onMounted(() => {
    visibilityHandler = () => {
      if (document.visibilityState === 'visible' && lastFetchParams && !loading.value && authStore.isAuthenticated) {
        fetchAppointments(lastFetchParams.start, lastFetchParams.end, lastFetchParams.doctorId)
      }
    }
    document.addEventListener('visibilitychange', visibilityHandler)
  })

  onBeforeUnmount(() => {
    disposed = true
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
    }
    if (fetchController) {
      fetchController.abort()
    }
  })

  const weekDays = computed(() => {
    if (view.value !== 'week') return []
    const start = new Date(currentDate.value)
    start.setDate(start.getDate() - start.getDay())
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    return days
  })

  const appointmentsByDay = computed(() => {
    const map = {}
    const list = appointments.value
    if (!list) return map
    for (const apt of list) {
      const dateStr = apt.appointment_date
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(apt)
    }
    return map
  })

  const weeklyViewData = computed(() => {
    if (view.value !== 'week') return []
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const todayStr = toISODate(new Date())
    const map = appointmentsByDay.value
    return weekDays.value.map((date, i) => {
      const dateStr = toISODate(date)
      return {
        date: dateStr,
        weekday: dayNames[i],
        appointments: map[dateStr] || [],
        isWeekend: i === 5 || i === 6,
        isToday: dateStr === todayStr,
      }
    })
  })

  function addAppointmentLocal(apt) {
    appointments.value = [...appointments.value, apt]
  }

  function removeAppointmentLocal(id) {
    appointments.value = appointments.value.filter(a => a.id !== id)
  }

  function updateAppointmentLocal(id, updates) {
    const idx = appointments.value.findIndex(a => a.id === id)
    if (idx === -1) return
    const updated = { ...appointments.value[idx], ...updates }
    const copy = [...appointments.value]
    copy[idx] = updated
    appointments.value = copy
  }

  return {
    view,
    currentDate,
    appointments,
    loading,
    error,
    fetchAppointments,
    weeklyViewData,
    addAppointmentLocal,
    removeAppointmentLocal,
    updateAppointmentLocal,
  }
}