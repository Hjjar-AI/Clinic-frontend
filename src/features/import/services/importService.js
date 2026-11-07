// frontend/src/features/import/services/importService.js
import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'

export default {
  async downloadPatientTemplate() {
    const response = await apiClient.get('/bulk-import/template/', { responseType: 'blob' })
    return response.data
  },
  async previewPatients(file, doctorId) {
    const fd = new FormData()
    fd.append('file', file)
    if (doctorId) fd.append('doctor_id', doctorId)
    const res = await apiClient.post('/bulk-import/preview/', fd)
    return unwrapResponse(res)
  },
  async importPatients(file, doctorId, previewToken) {
    const fd = new FormData()
    fd.append('file', file)
    if (doctorId) fd.append('doctor_id', doctorId)
    if (previewToken) fd.append('preview_token', previewToken)
    const res = await apiClient.post('/bulk-import/', fd)
    return unwrapResponse(res)
  },
  async previewDiagnoses(file, mergeMode) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('category', 'diagnosis')
    fd.append('merge_mode', mergeMode)
    fd.append('preview', 'true')
    const res = await apiClient.post('/bulk-import/options/', fd)
    return unwrapResponse(res)
  },
  async importDiagnoses(file, mergeMode, previewToken) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('category', 'diagnosis')
    fd.append('merge_mode', mergeMode)
    fd.append('preview_token', previewToken)
    const res = await apiClient.post('/bulk-import/options/', fd)
    return unwrapResponse(res)
  },
  async uploadMedications(file) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await apiClient.post('/bulk-import/medications/upload/', fd)
    return unwrapResponse(res)
  },
  async mapMedications(file, columnMap, mergeMode, previewToken, preview = false) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('column_map', JSON.stringify(Object.fromEntries(Object.entries(columnMap).map(([key, value]) => [key, value === '' ? null : value]))))
    if (preview) fd.append('preview', 'true')
    fd.append('merge_mode', mergeMode)
    fd.append('preview_token', previewToken)
    const res = await apiClient.post('/bulk-import/medications/map/', fd)
    return unwrapResponse(res)
  }
}
