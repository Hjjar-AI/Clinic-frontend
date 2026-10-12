import { onSessionChange, sessionGeneration } from '@/services/sessionState'
// frontend/src/features/dashboard/stores/analytics.js
import { defineStore } from 'pinia'
import { reactive,ref } from 'vue'

import dashboardService from '@/features/dashboard/services/dashboardService'
import apiClient from '@/services/apiClient'

export const useAnalyticsStore = defineStore('analytics', () => {
  const dashboard = ref({
    total_patients: 0, total_visits: 0, appointments_today: 0, pending_tasks: 0,
    high_risk_patients: [], recent_patients: [], today_appointments: [],
  })
  const chartData = ref({ months_labels: [], visits_counts: [], top_diagnoses_labels: [], top_diagnoses_counts: [], weekday_labels: [], weekday_data: [] })
  const statistics = ref({
    male_count: 0, female_count: 0, avg_age: 0, avg_visits_per_patient: 0, total_appointments: 0,
    top_medication: ['', 0], top_diagnosis: ['', 0], completed_tasks: 0, appointments_today: 0,
    appointments_week: 0, pending_tasks: 0,
  })
  const loading = ref(false)
  const error = ref(null)

  const cache = reactive({ dashboard: null, charts: null })

  let dashboardRequest = null
  let chartGeneration = 0
  let pending = 0
  function reset() {
    dashboardRequest = null
    chartGeneration += 1
    pending = 0
    dashboard.value = { high_risk_patients: [], recent_patients: [], today_appointments: [] }
    chartData.value = { months_labels: [], visits_counts: [] }
    cache.dashboard = null; cache.charts = null
    loading.value = false
    error.value = null
  }

  onSessionChange(reset)
  async function fetchDashboard(dateFrom, dateTo, { background = false } = {}) {
    const key = JSON.stringify([dateFrom, dateTo])
    if (dashboardRequest?.key === key) return dashboardRequest.promise
    const epoch = sessionGeneration()
    const request = { key, promise: null }
    if (!background) { pending += 1; loading.value = true }
    error.value = null
    request.promise = (async () => {
      try {
        const params = { ...(dateFrom ? { date_from: dateFrom } : {}), ...(dateTo ? { date_to: dateTo } : {}) }
        const data = await dashboardService.getDashboard(params)
        if (epoch !== sessionGeneration() || request !== dashboardRequest) return false
        dashboard.value = data; cache.dashboard = data
        return true
      } catch (failure) {
        if (epoch === sessionGeneration() && request === dashboardRequest) error.value = 'تعذر تحديث لوحة التحكم'
        throw failure
      } finally {
        if (epoch === sessionGeneration() && !background) { pending = Math.max(0, pending - 1); loading.value = pending > 0 }
        if (dashboardRequest === request) dashboardRequest = null
      }
    })()
    dashboardRequest = request
    return request.promise
  }

  async function fetchCharts(dateFrom, dateTo) {
    const request = ++chartGeneration
    const epoch = sessionGeneration()
    pending += 1
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const data = await dashboardService.getCharts(params)
      if (epoch !== sessionGeneration() || request !== chartGeneration) return false
      chartData.value = data
      cache.charts = data
      return true
    } catch (e) {
      if (request === chartGeneration) error.value = 'تعذر تحميل الرسم'
      throw e
    } finally {
      if (epoch === sessionGeneration()) { pending = Math.max(0, pending - 1); loading.value = pending > 0 }
    }
  }

  async function fetchStatistics(dateFrom, dateTo) {
    const params = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    const data = await dashboardService.getDashboard(params)
    statistics.value = { ...statistics.value, ...data }
  }

  async function markAllOverdue() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('/visits/mark-all-overdue/')
      return res.data
    } catch (e) {
      error.value = e.message || 'فشل العملية'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { dashboard, chartData, statistics, loading, error, reset, fetchDashboard, fetchCharts, fetchStatistics, markAllOverdue }
})