// frontend/src/composables/useSearch.js
import { ref } from 'vue'

import { debounce } from '@/utils'

/**
 * Unified search composable with optional debounce.
 *
 * @param {Function} searchFn – async function that returns results
 * @param {Object}   [options]
 * @param {number}   [options.delay=300] – debounce delay in ms (0 = no debounce)
 * @param {number}   [options.minLength=2] – minimum query length to trigger search
 * @returns {{ query, results, loading, error, onInput, clear }}
 */
export function useSearch(searchFn, { delay = 300, minLength = 2 } = {}) {
  const query = ref('')
  const results = ref([])
  const loading = ref(false)
  const error = ref(null)
  let seq = 0

  const performSearch = async () => {
    const currentQuery = query.value.trim()
    if (currentQuery.length < minLength) {
      results.value = []
      return
    }
    const currentSeq = ++seq
    loading.value = true
    error.value = null
    try {
      const data = await searchFn(currentQuery)
      if (currentSeq === seq) {
        results.value = data
      }
    } catch (e) {
      if (currentSeq === seq) {
        error.value = e.message || 'خطأ في البحث'
        results.value = []
      }
    } finally {
      if (currentSeq === seq) {
        loading.value = false
      }
    }
  }

  const debouncedPerform = delay > 0 ? debounce(performSearch, delay) : performSearch

  function onInput(value) {
    query.value = value
    debouncedPerform()
  }

  function clear() {
    query.value = ''
    results.value = []
    loading.value = false
    error.value = null
  }

  return { query, results, loading, error, onInput, clear }
}

// Legacy alias kept for backward compatibility
export const useDebouncedSearch = (searchFn, delay = 300) =>
  useSearch(searchFn, { delay, minLength: 0 })