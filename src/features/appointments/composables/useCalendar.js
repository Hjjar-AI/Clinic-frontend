// frontend/src/features/appointments/composables/useCalendar.js
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import { useDate } from '@/composables/useDate'
import { useAuthStore } from '@/features/auth/stores/auth'
import apiClient, { cancelPendingRequests } from '@/services/apiClient'

export function useCalendar() {
  const view = ref('day')
  const currentDate = ref(new Date())
  const appointments = shallowRef([])
  const loading = ref(false)
  const { toISODate } = useDate()
  const authStore = useAuthStore()

  let lastFetchParams = null
  let fetchController = null

  async function fetchAppointments(startDate, endDate, doctorId = null) {
    // Only fetch if authenticated
    if (!authStore.isAuthenticated) return

    if (fetchController) {
      fetchController.abort()
    }
    fetchController = new AbortController()
    cancelPendingRequests('/appointments/raw')

    loading.value = true
    lastFetchParams = { start: startDate, end: endDate, doctorId }

    try {
      const params = {
        start_date: toISODate(startDate),
        end_date: toISODate(endDate),
        per_page: 500,
      }
      if (doctorId) params.doctor_id = doctorId

      const { data } = await apiClient.get('/appointments/raw', {
        params,
        signal: fetchController.signal,
      })

      const inner = data?.data || data
      appointments.value = inner?.appointments ? [...inner.appointments] : []
    } catch (e) {
      if (e.name !== 'AbortError' && e.name !== 'CanceledError') {
        console.error('[Calendar] Fetch failed', e)
      }
    } finally {
      loading.value = false
      fetchController = null
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
    fetchAppointments,
    weeklyViewData,
    addAppointmentLocal,
    removeAppointmentLocal,
    updateAppointmentLocal,
  }
}