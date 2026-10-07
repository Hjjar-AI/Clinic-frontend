// frontend/src/stores/plugins/persist.js
import { safeGetItem, safeJsonParse,safeSetItem } from '@/utils/storage'

/**
 * Pinia plugin that persists store state to localStorage.
 * Only keys listed in the required `paths` allow-list are persisted.
 *
 * Usage:
 *   defineStore('mystore', {
 *     state: () => ({ ... }),
 *     persist: { key: 'my_store_key', paths: ['sidebarCollapsed', 'density'] }
 *   })
 */
export function persistPlugin({ store }) {
  const config = store.$options?.persist
  if (!config) return

  const paths = config.paths
  if (!Array.isArray(paths) || paths.length === 0) {
    console.warn(`[persist] Store "${store.$id}" must declare a non-empty paths allow-list`)
    return
  }

  const storageKey = config.key || store.$id

  // Hydrate on creation
  const saved = safeGetItem(storageKey)
  if (saved) {
    try {
      const data = safeJsonParse(saved)
      if (data) {
        for (const path of paths) {
          if (path in data) {
            store[path] = data[path]
          }
        }
      }
    } catch { /* ignore */ }
  }

  // Watch for changes and persist
  store.$subscribe((mutation, state) => {
    const partial = {}
    for (const key of paths) {
      if (key in state) {
        partial[key] = state[key]
      }
    }
    safeSetItem(storageKey, JSON.stringify(partial))
  })
}
