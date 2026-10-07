// frontend/src/utils/storage.js

/**
 * Safely parse a JSON string. Returns the parsed value, or fallback on error.
 */
export function safeJsonParse(json, fallback = null) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Safely set an item in localStorage, handling QuotaExceededError.
 */
export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      console.warn('localStorage quota exceeded')
      // Optionally: clear old items, notify user, etc.
    } else {
      console.error('localStorage error:', e)
    }
    return false
  }
}

/**
 * Safely get an item from localStorage. Returns null if missing or error.
 */
export function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safely remove an item from localStorage.
 */
export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}