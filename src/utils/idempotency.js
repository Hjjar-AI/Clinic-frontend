// frontend/src/utils/idempotency.js
/**
 * Generates a unique idempotency key.
 * Callers should generate one per logical operation and reuse it across retries.
 */
export function generateIdempotencyKey() {
  return `idem-${crypto.randomUUID()}`
}
