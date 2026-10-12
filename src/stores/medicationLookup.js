// frontend/src/stores/medicationLookup.js
import { defineStore } from 'pinia'

import medicationService from '@/features/clinical/services/medicationService'
import { createLookupStore } from '@/stores/lookupStoreFactory'

const useMedicationLookupBase = createLookupStore(
  'medicationLookup',
  (params) => medicationService.getAll(params),
  'medications'
)

export const useMedicationLookup = defineStore('medicationLookup', () => {
  return useMedicationLookupBase()
})