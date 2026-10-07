// frontend/src/services/prescriptionService.js
import apiClient from '@/services/apiClient'

// Prescription generation – no CRUD factory needed.

export default {
  preview(visitId) {
    return apiClient.get(`/prescription/visit/${visitId}`)
  },
  generate(payload) {
    return apiClient.post('/prescription/generate', payload, { responseType: 'blob' })
  }
}
