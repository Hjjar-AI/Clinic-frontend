// frontend/src/features/visits/composables/useVisitLookups.js
import { computed, ref, watch } from 'vue'

import { useApi } from '@/composables/useApi'
import { useLookupStore } from '@/stores/lookups'

const CACHE_KEYS = {
  diagnoses: 'lookup_diagnoses',
  medications: 'lookup_medications',
  scales: 'lookup_scales',
}

const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * Loads the visit-form lookup lists (diagnoses, medications, scales).
 *
 * Each lookup is backed by a named `useApi` query with a stable cache key.
 * The keys must be explicit because the underlying store methods
 * (`fetchDiagnoses`, `fetchMedications`, `fetchScales`) all resolve to the
 * same named function (`fetch`), so `apiFn.name` alone cannot discriminate
 * them.
 *
 * `staleTime` is set to one hour — this mirrors the previous `useSWR`
 * behaviour and prevents the visit form from re-hitting the lookup
 * endpoints on every mount.
 */
export function useVisitLookups() {
  const lookupStore = useLookupStore()
  const diagnosesInitial = ref([])
  const medicationsInitial = ref([])

  const { data: diagnoses, loading: loadingDiag } = useApi(
    () => lookupStore.fetchDiagnoses(),
    {
      mutation: false,
      queryKey: [CACHE_KEYS.diagnoses],
      immediate: true,
      staleTime: ONE_HOUR_MS,
      silent: true,
    }
  )

  const { data: medications, loading: loadingMed } = useApi(
    () => lookupStore.fetchMedications(),
    {
      mutation: false,
      queryKey: [CACHE_KEYS.medications],
      immediate: true,
      staleTime: ONE_HOUR_MS,
      silent: true,
    }
  )

  // Scales are only used for the loading flag here — the data itself is
  // consumed by useVisitScales. We still warm the cache for consistency.
  const { loading: loadingScales } = useApi(
    () => lookupStore.fetchScales(),
    {
      mutation: false,
      queryKey: [CACHE_KEYS.scales],
      immediate: true,
      staleTime: ONE_HOUR_MS,
      silent: true,
    }
  )

  // Keep the initial arrays in sync with cached data
  watch(
    diagnoses,
    (newData) => {
      diagnosesInitial.value = (newData || []).slice(0, 20)
    },
    { immediate: true }
  )

  watch(
    medications,
    (newData) => {
      medicationsInitial.value = (newData || []).slice(0, 20)
    },
    { immediate: true }
  )

  async function searchDiagnoses(query) {
    const all = diagnoses.value || []
    if (!query) return all.slice(0, 20)
    const q = query.toLowerCase()
    return all
      .filter(
        (d) =>
          (d.arabic_name || d.english_name || '').toLowerCase().includes(q) ||
          (d.code || '').toLowerCase().includes(q)
      )
      .slice(0, 20)
  }

  async function searchMedications(query) {
    const all = medications.value || []
    if (!query) return all.slice(0, 20)
    const q = query.toLowerCase()
    return all
      .filter((m) =>
        (m.generic_arabic || m.generic_english || m.display_name || '')
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 20)
  }

  // `loadingDiag`, `loadingMed`, `loadingScales` are each ComputedRef<boolean>.
  // The previous version chained them with `||`, which returned the first
  // truthy *ref* rather than combining the booleans — so the composite flag
  // was always "true" the moment `loadingDiag` was defined.
  const loading = computed(
    () => loadingDiag.value || loadingMed.value || loadingScales.value
  )

  return {
    diagnosesInitial,
    medicationsInitial,
    searchDiagnoses,
    searchMedications,
    loading,
  }
}