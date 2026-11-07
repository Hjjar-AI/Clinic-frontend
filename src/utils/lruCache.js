// frontend/src/utils/lruCache.js

/**
 * Creates a generic LRU (Least Recently Used) cache.
 *
 * @param {number} maxSize – maximum number of entries
 * @returns {Object} cache instance with methods: get, set, has, delete, clear, entries
 */
export function createLRUCache(maxSize = 100) {
  const map = new Map()

  function get(key) {
    if (!map.has(key)) return undefined
    // Move to end to mark as recently used
    const value = map.get(key)
    map.delete(key)
    map.set(key, value)
    return value
  }

  function set(key, value) {
    if (map.has(key)) {
      map.delete(key)
    } else if (map.size >= maxSize) {
      // Evict the least recently used (first inserted, since we move to end on access)
      const firstKey = map.keys().next().value
      map.delete(firstKey)
    }
    map.set(key, value)
  }

  function has(key) {
    return map.has(key)
  }

  function deleteItem(key) {
    map.delete(key)
  }

  function clear() {
    map.clear()
  }

  function entries() {
    return Array.from(map.entries())
  }

  function size() {
    return map.size
  }

  return { get, set, has, delete: deleteItem, clear, entries, size }
}