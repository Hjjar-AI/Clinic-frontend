// frontend/src/stores/lookupStoreFactory.js
import { reactive, shallowRef, watch } from 'vue'

/**
 * Factory that creates a lightweight, read-only lookup store.
 * Handles both paginated and non-paginated responses.
 *
 * @param {string}   storeId   – unique Pinia store id (e.g. 'diagnosisLookup')
 * @param {Function} fetchFn   – async function returning the raw API response (axios response)
 * @param {string}   listKey   – key inside the response that holds the array (for fallback)
 * @returns {Function}         – a composable (useXxxLookup)
 */
export function createLookupStore(storeId, fetchFn, listKey) {
  let _loaded = false
  const items = shallowRef([])
  const itemsMap = reactive(new Map())

  watch(items, (list) => {
    itemsMap.clear()
    for (const item of list) {
      if (item && item.id !== undefined) {
        itemsMap.set(item.id, Object.freeze({ ...item }))
      }
    }
  }, { immediate: true })

  async function fetch(force = false) {
    if (!force && _loaded) return items.value
    const response = await fetchFn()
    // Extract data from axios response: response.data may be the envelope or the direct data
    const rawData = response?.data?.data || response?.data || response
    // If the data is an object, try to find the list in common keys: 'items', the provided listKey, or 'results'
    let list = []
    if (Array.isArray(rawData)) {
      list = rawData
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.items)) {
        list = rawData.items
      } else if (listKey && Array.isArray(rawData[listKey])) {
        list = rawData[listKey]
      } else if (Array.isArray(rawData.results)) {
        list = rawData.results
      }
    }
    // Freeze items to prevent accidental mutation
    list.forEach(item => Object.freeze(item))
    items.value = Object.freeze(list)
    _loaded = true
    return items.value
  }

  function invalidate(id) {
    if (id !== undefined) {
      itemsMap.delete(id)
      const current = items.value
      const idx = current.findIndex(i => i.id === id)
      if (idx !== -1) {
        const copy = [...current]
        copy.splice(idx, 1)
        items.value = Object.freeze(copy)
      }
    } else {
      items.value = []
      itemsMap.clear()
      _loaded = false
    }
  }

  function invalidateAll() {
    invalidate()
  }

  return () => ({
    items,
    itemsMap,
    fetch,
    invalidate,
    invalidateAll,
  })
}
