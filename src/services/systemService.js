import apiClient, { unwrapResponse } from '@/services/apiClient'
let configPromise
let versionPromise
export default {
  config({ fresh = false } = {}) {
    if (fresh) configPromise = null
    if (!configPromise) configPromise = apiClient.get('/system/config/').then(unwrapResponse).catch(error => { configPromise = null; throw error })
    return configPromise
  },
  health(full = false) { return apiClient.get(full ? '/system/health/full/' : '/system/health/') },
  statusConstants() { return apiClient.get('/system/status-constants/').then(unwrapResponse) },
  clinicalConstants() { return apiClient.get('/options/clinical-constants/').then(unwrapResponse) },
  version() {
    if (!versionPromise) versionPromise = apiClient.get('/system/version/').then(unwrapResponse).catch(error => { versionPromise = null; throw error })
    return versionPromise
  },
}
