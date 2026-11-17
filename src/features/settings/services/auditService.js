import apiClient, { unwrapResponse } from '@/services/apiClient'
export default { getAll(params) { return apiClient.get('/audit-logs/', { params }).then(unwrapResponse) } }
