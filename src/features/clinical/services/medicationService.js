// frontend/src/services/medicationService.js
import apiClient from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/options/medications')

export default {
  ...base,
  export(params = {}) {
    return apiClient.get('/exports/medications/excel/', { params, responseType: 'blob' })
  },
  reactivate(id) {
    return apiClient.post(`/options/medications/${id}/reactivate/`)
  },
}
