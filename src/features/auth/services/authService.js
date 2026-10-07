import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'

export default {
  async login(credentials) {
    // Bootstrap the CSRF cookie before anonymous session login.
    await apiClient.get('/system/config/')
    const res = await apiClient.post('/auth/login/', credentials)
    return unwrapResponse(res)
  },
  async logout() {
    const res = await apiClient.post('/auth/logout/')
    return unwrapResponse(res)
  },
  async getMe() {
    const res = await apiClient.get('/auth/me/')
    return unwrapResponse(res)
  },
  async changePassword(data) {
    const res = await apiClient.post('/auth/change-password/', data)
    return unwrapResponse(res)
  }
}