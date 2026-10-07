// frontend/src/stores/constants.js
import { defineStore } from 'pinia'
import { shallowRef } from 'vue'

import {
  FOLLOW_UP_TYPE,
  LEVEL_OF_CARE,
  MARITAL_STATUS_FEMALE,
  MARITAL_STATUS_MALE,
  SUICIDE_RISK_LEVELS,
  VIOLENCE_RISK_LEVELS,
} from '@/constants/statusConstants'
import apiClient from '@/services/apiClient'

export const useConstantsStore = defineStore('constants', () => {
  const data = shallowRef({
    suicide_risk_levels: SUICIDE_RISK_LEVELS,
    violence_risk_levels: VIOLENCE_RISK_LEVELS,
    level_of_care: LEVEL_OF_CARE,
    follow_up_type: FOLLOW_UP_TYPE,
    marital_status_male: MARITAL_STATUS_MALE,
    marital_status_female: MARITAL_STATUS_FEMALE,
  })

  let fetched = false
  let fetchPromise = null

  async function fetch() {
    if (fetched || fetchPromise) return fetchPromise

    fetchPromise = (async () => {
      try {
        const res = await apiClient.get('/options/clinical-constants/')
        const payload = res?.data?.data || res?.data || {}
        if (payload && typeof payload === 'object') {
          data.value = {
            suicide_risk_levels: payload.suicide_risk_levels || SUICIDE_RISK_LEVELS,
            violence_risk_levels: payload.violence_risk_levels || VIOLENCE_RISK_LEVELS,
            level_of_care: payload.level_of_care || LEVEL_OF_CARE,
            follow_up_type: payload.follow_up_type || FOLLOW_UP_TYPE,
            marital_status_male: payload.marital_status_male || MARITAL_STATUS_MALE,
            marital_status_female: payload.marital_status_female || MARITAL_STATUS_FEMALE,
          }
        }
        fetched = true
      } catch (e) {
        console.warn('Failed to load clinical constants; using fallbacks', e)
      } finally {
        fetchPromise = null
      }
    })()

    return fetchPromise
  }

  function invalidate() {
    fetched = false
    fetchPromise = null
  }

  return { data, fetch, invalidate }
})