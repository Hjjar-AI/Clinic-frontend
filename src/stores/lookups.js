// frontend/src/stores/lookups.js
/**
 * Backward-compatibility wrapper.
 * Existing code that does `useLookupStore()` keeps working.
 * New code should import the individual stores directly.
 */
import { useDiagnosisLookup } from '@/stores/diagnosisLookup'
import { useMedicationLookup } from '@/stores/medicationLookup'
import { useScaleLookup } from '@/stores/scaleLookup'

export function useLookupStore() {
  const diagStore = useDiagnosisLookup()
  const medStore = useMedicationLookup()
  const scaleStore = useScaleLookup()

  return {
    // aliases that match the old interface
    diagnoses: diagStore.items,
    medications: medStore.items,
    scales: scaleStore.items,

    fetchDiagnoses: diagStore.fetch,
    fetchMedications: medStore.fetch,
    fetchScales: scaleStore.fetch,

    invalidateDiagnoses: diagStore.invalidateAll,
    invalidateMedications: medStore.invalidateAll,

    invalidateDiagnosis: (id) => diagStore.invalidate(id),
    invalidateMedication: (id) => medStore.invalidate(id),

    async fetchAll() {
      await Promise.all([
        diagStore.fetch(),
        medStore.fetch(),
        scaleStore.fetch(),
      ])
    },

    invalidateAll() {
      diagStore.invalidateAll()
      medStore.invalidateAll()
      scaleStore.invalidateAll()
    },
  }
}