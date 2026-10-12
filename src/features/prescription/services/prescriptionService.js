// frontend/src/services/prescriptionService.js
import apiClient from '@/services/apiClient'

// Prescription generation – no CRUD factory needed.

export default {
  calibration(printOptions) {
    return apiClient.post('/prescription/calibration', { print_options: printOptions }, { responseType: 'blob' })
  },
  preview(visitId) {
    return apiClient.get(`/prescription/visit/${visitId}`)
  },
  generate(payload) {
    return apiClient.post('/prescription/generate', payload, { responseType: 'blob' })
  }
}
