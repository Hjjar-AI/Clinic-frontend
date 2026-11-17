// frontend/src/services/scaleService.js
import apiClient from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/scales')

export default {
  ...base,
  getById(id) {
    return base.getById(id)
  },
  delete(id, version) {
    return base.delete(id, version)
  },
  addField(scaleId, data) {
    return apiClient.post(`/scales/${scaleId}/add-field/`, data)
  },
  reactivate(id, version) {
    return apiClient.post(`/scales/${id}/reactivate/`, { version })
  }
}
