// frontend/src/services/invoiceService.js
import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/billing')

export default {
  ...base,
  async transition(id, status, version, reason = '') {
    const response = await apiClient.put(`/billing/${id}/transition/`, { status, version, reason })
    return unwrapResponse(response)
  },
  exportPdf(id) {
    return apiClient.get(`/billing/${id}/pdf/`, { responseType: 'blob' })
  }
}
