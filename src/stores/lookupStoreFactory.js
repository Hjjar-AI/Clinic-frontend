// frontend/src/stores/lookupStoreFactory.js
import { reactive, shallowRef, watch } from 'vue'
import { fetchCatalog } from '@/utils/catalogFetch'
import { onSessionChange } from '@/services/sessionState'

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

  let inFlight = null
  let generation = 0
  async function fetch(force = false) {
    if (!force && _loaded) return items.value
    if (inFlight) return inFlight
    const current = generation
    const promise = fetchCatalog(fetchFn, listKey).then(list => {
      if (current !== generation) return []
      items.value = Object.freeze(list.map(item => Object.freeze({ ...item })))
      _loaded = true
      return items.value
    }).finally(() => { if (inFlight === promise) inFlight = null })
    inFlight = promise
    return promise
  }

  function invalidate(id, reload = true) {
    const wasLoaded = _loaded
    generation += 1
    inFlight = null
    _loaded = false
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
    if (reload && wasLoaded) fetch().catch(() => {})
  }

  function invalidateAll() {
    invalidate()
  }

  onSessionChange(() => invalidate(undefined, false))
  return () => ({
    items,
    itemsMap,
    fetch,
    invalidate,
    invalidateAll,
  })
}
