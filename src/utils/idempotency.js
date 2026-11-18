// frontend/src/utils/idempotency.js
/**
 * Generates a unique idempotency key.
 * Callers should generate one per logical operation and reuse it across retries.
 */
export function generateIdempotencyKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return `idem-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`
}
