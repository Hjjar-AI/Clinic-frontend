// frontend/src/features/visits/composables/useVisitLookups.js
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

import { useLookupStore } from '@/stores/lookups'

/** Clinical options share the reactive catalog owner and its invalidation. */
export function useVisitLookups() {
  const lookupStore = useLookupStore()
  const diagnoses = lookupStore.diagnoses
  const medications = lookupStore.medications
  const diagnosesInitial = computed(() => diagnoses.value.slice(0, 20))
  const medicationsInitial = computed(() => medications.value.slice(0, 20))
  const loading = ref(false)
  const error = ref('')
  let disposed = false
  onBeforeUnmount(() => { disposed = true })
  async function retry() {
    if (loading.value || disposed) return
    loading.value = true; error.value = ''
    try { await lookupStore.fetchAll() }
    catch { if (!disposed) error.value = 'تعذر تحميل الخيارات الطبية؛ أعد المحاولة' }
    finally { if (!disposed) loading.value = false }
  }
  onMounted(retry)

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

  return {
    diagnosesInitial,
    medicationsInitial,
    searchDiagnoses,
    searchMedications,
    loading, error, retry,
  }
}