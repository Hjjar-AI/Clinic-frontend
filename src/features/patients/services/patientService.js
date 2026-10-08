// frontend/src/features/patients/services/patientService.js
import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/patients')

export default {
  ...base,
  async search(params) {
    const res = await apiClient.get('/patients/search', { params })
    return unwrapResponse(res)
  },
  async findDuplicates(data) {
    const res = await apiClient.post('/patients/duplicates/', data)
    return unwrapResponse(res)
  },
  async getById(id, include = '') {
    const res = await apiClient.get(`/patients/${id}`, { params: { include } })
    return unwrapResponse(res)
  },
  async getVisits(patientId) {
    const res = await apiClient.get(`/patients/${patientId}/visits/`)
    return unwrapResponse(res)
  },
  async getDocuments(patientId) {
    const res = await apiClient.get(`/patients/${patientId}/documents`)
    return unwrapResponse(res)
  },
  async uploadDocument(patientId, formData) {
    // Let Axios handle multipart boundary automatically.
    const res = await apiClient.post(`/patients/${patientId}/documents`, formData)
    return unwrapResponse(res)
  },
  async exportPdf(patientId) {
    const res = await apiClient.get(`/exports/patients/${patientId}/pdf/`, { responseType: 'blob' })
    return res.data
  },
  async exportWord(patientId) {
    const res = await apiClient.get(`/exports/patients/${patientId}/word/`, { responseType: 'blob' })
    return res.data
  },
  async exportCsv(fields = [], filters = {}) {
    const res = await apiClient.get('/exports/patients/csv/', {
      params: { ...filters, fields: fields.join(',') },
      responseType: 'blob'
    })
    return res.data
  },
  async exportExcel(fields = [], filters = {}) {
    const res = await apiClient.get('/exports/patients/excel/', {
      params: { ...filters, fields: fields.join(',') },
      responseType: 'blob'
    })
    return res.data
  },

  // ── Care team ────────────────────────────────────────────────
  // These used to live inline in PatientDetail.vue and PatientCareTeamTab.vue
  // as direct apiClient calls. Centralising them here keeps the service
  // layer as the single entry point for patient-related requests.
  async getCareTeam(patientId) {
    const res = await apiClient.get(`/patients/${patientId}/care_team/`)
    return unwrapResponse(res)
  },
  async addCareTeamMember(patientId, userId, role, version) {
    const res = await apiClient.post(`/patients/${patientId}/care_team_add/`, {
      user_id: userId,
      role,
      version,
    })
    return unwrapResponse(res)
  },
  async removeCareTeamMember(patientId, userId, version, reason) {
    const res = await apiClient.delete(`/patients/${patientId}/care-team/${userId}/`, { data: { version, reason } })
    return unwrapResponse(res)
  },
  async getTeamCandidates() { return unwrapResponse(await apiClient.get('/patients/team_candidates/')) },
  async getRecords(id, kind, offset = 0) { return unwrapResponse(await apiClient.get(`/patients/${id}/records/`, { params: { kind, offset } })) },
  async saveRecord(id, payload) { return unwrapResponse(await apiClient.post(`/patients/${id}/records/`, payload)) },
  async getCorrections(id, offset = 0) { return unwrapResponse(await apiClient.get(`/patients/${id}/corrections/`, { params: { offset } })) },
  async reviewDuplicate(id, payload) { return unwrapResponse(await apiClient.post(`/patients/${id}/duplicate_review/`, payload)) },
  async previewMerge(id, targetId) { return unwrapResponse(await apiClient.post(`/patients/${id}/merge_preview/`, { target_id: targetId })) },
  async mergePatient(id, payload) { return unwrapResponse(await apiClient.post(`/patients/${id}/merge/`, payload)) },
  async updateDocument(id, documentId, payload) { return unwrapResponse(await apiClient.patch(`/patients/${id}/documents/${documentId}/`, payload)) },
  async archiveDocument(id, documentId, version) { return apiClient.delete(`/patients/${id}/documents/${documentId}/`, { data: { version } }) },
  async downloadDocument(id, documentId) { const response = await apiClient.get(`/patients/${id}/documents/${documentId}/download/`, { responseType: 'blob' }); return response.data },

}
