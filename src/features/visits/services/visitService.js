// frontend/src/features/visits/services/visitService.js
import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/visits')

export default {
  getAll: base.getAll,
  getById: base.getById,
  update: base.update,
  delete: base.delete,

  async create(patientId, data) {
    const res = await apiClient.post(`/patients/${patientId}/visits/`, data)
    return unwrapResponse(res)
  },
  async getByPatient(patientId) {
    const res = await apiClient.get(`/patients/${patientId}/visits/`)
    return unwrapResponse(res)
  },
  async completeFollowUp(id) {
    const res = await apiClient.put(`/visits/${id}/complete_follow_up/`)
    return unwrapResponse(res)
  },
  async transition(id, status, version, reason = '') {
    const res = await apiClient.put(`/visits/${id}/transition/`, { status, version, reason })
    return unwrapResponse(res)
  },
  async uploadAttachment(visitId, formData) {
    const res = await apiClient.post(`/visits/${visitId}/attachments/`, formData)
    return unwrapResponse(res)
  },
  async uploadAttachments(visitId, files) {
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    const res = await apiClient.post(`/visits/${visitId}/attachments/`, fd)
    return unwrapResponse(res)
  }
}
