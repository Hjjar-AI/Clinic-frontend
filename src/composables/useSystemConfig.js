// frontend/src/composables/useSystemConfig.js
import { ref } from 'vue'

import apiClient from '@/services/apiClient'

const config = ref({
  working_hours: { start: '08:00', end: '23:30' },
  max_attachment_size: 10 * 1024 * 1024,
  appointment_duration_default: 30,
  phone_min_length: 9,
  phone_max_length: 10,
  national_id_min_length: 10,
  national_id_max_length: 12,
  session_lifetime: 10800,
})

let loadingPromise = null
let loaded = false

export function useSystemConfig() {
  async function fetchConfig() {
    if (loaded) return
    if (loadingPromise) return loadingPromise

    loadingPromise = (async () => {
      try {
        const { data } = await apiClient.get('/system/config/')
        const inner = data?.data || data
        Object.assign(config.value, inner)
        loaded = true
      } catch (e) {
        console.warn('Failed to load system config, using defaults', e)
      } finally {
        loadingPromise = null
      }
    })()

    return loadingPromise
  }

  // Start fetching immediately (non‑blocking)
  fetchConfig()

  return { config, fetchConfig }
}