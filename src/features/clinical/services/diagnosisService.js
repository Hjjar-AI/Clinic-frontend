// frontend/src/services/diagnosisService.js
import apiClient from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/options/diagnoses')

export default {
  ...base,
  export(params = {}) {
    // Use the exports app endpoint
    return apiClient.get('/exports/diagnoses/excel/', { params, responseType: 'blob' })
  },
  reactivate(id) {
    return apiClient.post(`/options/diagnoses/${id}/reactivate/`)
  }
}
