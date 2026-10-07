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
  async addCareTeamMember(patientId, userId, role) {
    const res = await apiClient.post(`/patients/${patientId}/care_team_add/`, {
      user_id: userId,
      role,
    })
    return unwrapResponse(res)
  },
  async removeCareTeamMember(patientId, userId) {
    const res = await apiClient.delete(`/patients/${patientId}/care-team/${userId}/`)
    return unwrapResponse(res)
  },
}
