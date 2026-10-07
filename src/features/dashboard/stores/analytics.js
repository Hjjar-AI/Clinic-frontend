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

  function reset() {
    loading.value = false
    error.value = null
  }

  async function fetchDashboard(dateFrom, dateTo) {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const data = await dashboardService.getDashboard(params)
      dashboard.value = data
      cache.dashboard = data
    } catch (e) {
      error.value = e.message || 'خطأ في التحميل'
    } finally {
      loading.value = false
    }
  }

  async function fetchCharts(dateFrom, dateTo) {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const data = await dashboardService.getCharts(params)
      chartData.value = data
      cache.charts = data
    } catch (e) {
      error.value = e.message || 'خطأ في التحميل'
    } finally {
      loading.value = false
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