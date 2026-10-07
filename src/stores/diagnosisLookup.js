// frontend/src/stores/diagnosisLookup.js
import { defineStore } from 'pinia'

import diagnosisService from '@/features/clinical/services/diagnosisService'
import { createLookupStore } from '@/stores/lookupStoreFactory'

const useDiagnosisLookupBase = createLookupStore(
  'diagnosisLookup',
  () => diagnosisService.getAll(),
  'diagnoses'
)

export const useDiagnosisLookup = defineStore('diagnosisLookup', () => {
  return useDiagnosisLookupBase()
})