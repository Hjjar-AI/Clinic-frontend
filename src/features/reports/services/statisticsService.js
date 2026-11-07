// frontend/src/services/statisticsService.js
import apiClient from '@/services/apiClient'

export default {
  async getStatistics(params) {
    const res = await apiClient.get('/reports/statistics', { params })
    return res.data?.data || res.data
  },
  async getMonthlySummary(year, month) {
    const res = await apiClient.get('/reports/monthly-summary', { params: { year, month } })
    return res.data?.data || res.data
  },
  async getDoctorPerformance() {
    const res = await apiClient.get('/reports/doctor-performance')
    return res.data?.data || res.data
  },
  async getReconciliation() {
    const res = await apiClient.get('/reports/reconciliation/')
    return res.data?.data || res.data
  }
}
