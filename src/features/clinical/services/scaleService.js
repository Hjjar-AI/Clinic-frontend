// frontend/src/services/scaleService.js
import apiClient from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/scales')

export default {
  ...base,
  getById(id) {
    return base.getById(id)
  },
  delete(id) {
    return base.delete(id)
  },
  addField(scaleId, data) {
    return apiClient.post(`/scales/${scaleId}/add-field/`, data)
  },
  reactivate(id) {
    return apiClient.post(`/scales/${id}/reactivate/`)
  }
}
