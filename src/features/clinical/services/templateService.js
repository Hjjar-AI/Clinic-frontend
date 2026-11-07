// frontend/src/services/templateService.js
import apiClient from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/templates')

export default {
  ...base,
  reactivate(id) {
    return apiClient.post(`/templates/${id}/reactivate/`)
  },
}
