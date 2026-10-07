// frontend/src/features/tasks/services/taskService.js
import apiClient, { unwrapResponse } from '@/services/apiClient'

export default {
  async getAll(params) {
    const response = await apiClient.get('/tasks', { params })
    return unwrapResponse(response)
  },

  create(data) {
    return apiClient.post('/tasks', data)
  },

  complete(id, version) {
    const data = version !== undefined ? { version } : {}
    return apiClient.put(`/tasks/${id}/complete/`, data)
  },

  cancel(id, version, reason = '') {
    const data = version !== undefined ? { version, reason } : { reason }
    return apiClient.put(`/tasks/${id}/cancel/`, data)
  },

  activate(id, version) {
    const data = version !== undefined ? { version } : {}
    return apiClient.put(`/tasks/${id}/activate/`, data)
  },

  transition(id, status, version, reason = '') {
    return apiClient.put(`/tasks/${id}/transition/`, { status, version, reason })
  },

  delete(id) {
    return apiClient.delete(`/tasks/${id}/`)
  },

  reorder(orderList) {
    return apiClient.put('/tasks/reorder/', { order: orderList })
  },
}
