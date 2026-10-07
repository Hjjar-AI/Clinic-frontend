// frontend/src/features/settings/services/userService.js
import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/auth/users')

export default {
  ...base,
  async getDoctors() {
    const res = await apiClient.get('/auth/users/doctors')
    return unwrapResponse(res)
  },
  async getPermissions(id) {
    const res = await apiClient.get(`/auth/users/permissions/${id}`)
    return unwrapResponse(res)
  },
  async updatePermissions(id, data) {
    const res = await apiClient.put(`/auth/users/permissions/${id}`, data)
    return unwrapResponse(res)
  }
}