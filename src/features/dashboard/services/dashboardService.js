import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'

export default {
  async getDashboard(params = {}) {
    const res = await apiClient.get('/dashboard/', { params })
    return unwrapResponse(res)
  },
  async getCharts(params = {}) {
    const res = await apiClient.get('/dashboard/charts', { params })
    return unwrapResponse(res)
  },
  async getSummary(params = {}) {
    const res = await apiClient.get('/dashboard/summary', { params })
    return unwrapResponse(res)
  }
}