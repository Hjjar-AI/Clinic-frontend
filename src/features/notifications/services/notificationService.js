import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'

export default {
  async getAll(params = {}) {
    const res = await apiClient.get('/notifications', { params })
    return unwrapResponse(res)
  },
  async getNotificationsPersistent(params = {}) {
    const res = await apiClient.get('/notifications', { params, __persistent: true })
    return unwrapResponse(res)
  },
  async markRead(id) {
    const res = await apiClient.put(`/notifications/${id}/mark_read/`)
    return unwrapResponse(res)
  },
  async markAllRead() {
    const res = await apiClient.put('/notifications/mark_all_read/')
    return unwrapResponse(res)
  },
  async delete(id) {
    const res = await apiClient.delete(`/notifications/${id}/`)
    return unwrapResponse(res)
  },
  async getUnreadCount() {
    const res = await apiClient.get('/notifications?unread_only=true&per_page=1')
    return unwrapResponse(res)
  }
}