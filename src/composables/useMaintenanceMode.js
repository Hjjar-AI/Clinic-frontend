import { ref } from 'vue'

import apiClient from '@/services/apiClient'

const maintenance = ref(false)

export function useMaintenanceMode() {
  async function check() {
    try {
      const { data } = await apiClient.get('/system/health/full/')
      maintenance.value = data?.data?.maintenance || false
    } catch {
      // Leave maintenance state unchanged on failure
    }
  }

  return { maintenance, check }
}