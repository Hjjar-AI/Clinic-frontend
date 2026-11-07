// frontend/src/stores/scaleLookup.js
import { defineStore } from 'pinia'

import scaleService from '@/features/clinical/services/scaleService'
import { createLookupStore } from '@/stores/lookupStoreFactory'

const useScaleLookupBase = createLookupStore(
  'scaleLookup',
  (params) => scaleService.getAll(params),
  'scales'
)

export const useScaleLookup = defineStore('scaleLookup', () => {
  return useScaleLookupBase()
})