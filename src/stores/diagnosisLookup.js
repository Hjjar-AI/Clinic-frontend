// frontend/src/stores/diagnosisLookup.js
import { defineStore } from 'pinia'

import diagnosisService from '@/features/clinical/services/diagnosisService'
import { createLookupStore } from '@/stores/lookupStoreFactory'

const useDiagnosisLookupBase = createLookupStore(
  'diagnosisLookup',
  (params) => diagnosisService.getAll(params),
  'diagnoses'
)

export const useDiagnosisLookup = defineStore('diagnosisLookup', () => {
  return useDiagnosisLookupBase()
})