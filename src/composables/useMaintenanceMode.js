import { ref } from 'vue'

import systemService from '@/services/systemService'

const maintenance = ref(false)

export function useMaintenanceMode() {
  async function check() {
    try {
      const { data } = await systemService.health(true)
      maintenance.value = data?.data?.maintenance || false
    } catch {
      // Leave maintenance state unchanged on failure
    }
  }

  return { maintenance, check }
}