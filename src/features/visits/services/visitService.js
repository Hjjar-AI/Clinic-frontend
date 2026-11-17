import { toCommand } from '@/services/contracts'
// frontend/src/features/visits/services/visitService.js
import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/visits', 'visit')

export default {
  markAllOverdue() { return apiClient.post('/visits/mark-all-overdue/').then(unwrapResponse) },
  async approvedReference(patientId, excludeVisit) {
    return unwrapResponse(await apiClient.get(`/prescription/patient/${patientId}/handover/`, { params: { exclude_visit: excludeVisit || undefined } }))
  },
  handoverPdf(visitId) {
    return apiClient.get(`/prescription/visit/${visitId}/handover/pdf/`, { responseType: 'blob' })
  },
  getAll: base.getAll,
  getById: base.getById,
  update: base.update,
  delete: base.delete,

  async create(patientId, data) {
    const res = await apiClient.post(`/patients/${patientId}/visits/`, toCommand('visit', data))
    return unwrapResponse(res)
  },
  async getByPatient(patientId) {
    const res = await apiClient.get(`/patients/${patientId}/visits/`)
    return unwrapResponse(res)
  },
  async transition(id, status, version, reason = '') {
    const res = await apiClient.put(`/visits/${id}/transition/`, { status, version, reason })
    return unwrapResponse(res)
  },
  revisions(id, offset = 0) { return apiClient.get(`/visits/${id}/revisions/`, { params: { offset, per_page: 20 } }).then(unwrapResponse) },
  issuedDocuments(id, offset = 0) { return apiClient.get(`/visits/${id}/issued-documents/`, { params: { offset, per_page: 20 } }).then(unwrapResponse) },
  attachments(id, offset = 0) { return apiClient.get(`/visits/${id}/list_attachments/`, { params: { offset, per_page: 20 } }).then(unwrapResponse) },
  attachmentPdf(id, attachmentId) { return apiClient.get(`/visits/${id}/attachments/${attachmentId}/`, { responseType: 'blob' }) },
  async removeAttachment(id, attachmentId, version) {
    const response = await apiClient.delete(`/visits/${id}/attachments/${attachmentId}/`, { data: { version } })
    return Number(response.headers['x-resource-version'])
  },
  async uploadAttachment(id, file, version) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('version', String(version))
    const response = await apiClient.post(`/visits/${id}/attachments/`, fd)
    return { attachment: unwrapResponse(response), version: Number(response.headers['x-resource-version']) }
  },
  async uploadAttachments(id, files, version) {
    const attachments = []
    for (const file of files) {
      const result = await this.uploadAttachment(id, file, version)
      version = result.version
      attachments.push(result.attachment)
    }
    return { attachments, version }
  },
}
