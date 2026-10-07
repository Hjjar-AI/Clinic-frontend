// frontend/src/services/apiEvents.js
/**
 * Tiny event bus for API-layer notifications.
 *
 * `apiClient` and `apiErrorHandler` are deliberately decoupled from Pinia
 * stores, the router, and the confirm dialog. They *emit* semantic events
 * (unauthorized, conflict, permissions-updated) and the application layer
 * (see `@/bootstrap/registerApiHandlers`) decides what to do about them.
 *
 * This removes the previous circular dependency:
 *   apiClient → useAuthStore → apiClient
 * and the hidden navigation side effect where an HTTP layer imported the
 * router directly.
 */

const listeners = new Map()

/**
 * Subscribe to an event. Returns an unsubscribe function.
 *
 * @param {string}   event
 * @param {Function} handler
 * @returns {() => void}
 */
export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event).add(handler)
  return function off() {
    listeners.get(event)?.delete(handler)
  }
}

/**
 * Emit an event. Listener exceptions are swallowed so a bad listener never
 * breaks the HTTP pipeline.
 *
 * @param {string} event
 * @param {any}    [payload]
 */
export function emit(event, payload) {
  const set = listeners.get(event)
  if (!set || set.size === 0) return
  for (const handler of set) {
    try {
      handler(payload)
    } catch (err) {
       
      console.error(`[apiEvents] handler for "${event}" threw`, err)
    }
  }
}

export const API_EVENTS = Object.freeze({
  UNAUTHORIZED: 'api:unauthorized',
  FORBIDDEN: 'api:forbidden',
  CONFLICT: 'api:conflict',
  PERMISSIONS_UPDATED: 'api:permissions-updated',
  NETWORK_ERROR: 'api:network-error',
  RATE_LIMITED: 'api:rate-limited',
})