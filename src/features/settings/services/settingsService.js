// frontend/src/features/settings/services/settingsService.js
import apiClient, { unwrapResponse } from '@/services/apiClient'

export default {
  async getSettings() {
    const res = await apiClient.get('/settings/')
    return unwrapResponse(res)
  },

  async updateSettings(data) {
    const res = await apiClient.put('/settings/', data)
    return unwrapResponse(res)
  },

  async setTheme(theme) {
    const res = await apiClient.put('/settings/theme/', { theme })
    return unwrapResponse(res)
  },

  async generateDemoData() {
    const res = await apiClient.post('/settings/generate-demo-data/')
    return unwrapResponse(res)
  },

  // Used by Settings.vue to decide whether to show the "generate demo data"
  // section. Kept in this service so the view does not import apiClient.
  async getSystemConfig() {
    const res = await apiClient.get('/system/config')
    return unwrapResponse(res)
  },
}