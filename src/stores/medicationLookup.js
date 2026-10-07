// frontend/src/stores/medicationLookup.js
import { defineStore } from 'pinia'

import medicationService from '@/features/clinical/services/medicationService'
import { createLookupStore } from '@/stores/lookupStoreFactory'

const useMedicationLookupBase = createLookupStore(
  'medicationLookup',
  () => medicationService.getAll(),
  'medications'
)

export const useMedicationLookup = defineStore('medicationLookup', () => {
  return useMedicationLookupBase()
})