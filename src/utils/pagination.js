// frontend/src/utils/pagination.js

/**
 * Extracts the list array from a paginated API response.
 * The backend uses a standard envelope:
 *   { data: { items: [...], meta: { total, next_cursor, has_more } } }
 * This function handles both the standard envelope and fallback keys.
 *
 * @param {Object} response - The raw axios response or the parsed data.
 * @param {string} fallbackKey - Optional model-specific key (e.g., 'patients').
 * @returns {Array} The extracted list.
 */
export function extractList(response, fallbackKey = 'items') {
  // Unwrap nested data structures
  const data = response?.data?.data || response?.data || response || {};
  // If the standard 'items' key exists, use it
  if (Array.isArray(data.items)) {
    return data.items;
  }
  // Otherwise try the fallback key (for backward compatibility)
  if (data[fallbackKey] && Array.isArray(data[fallbackKey])) {
    return data[fallbackKey];
  }
  // Last resort: return empty array
  return [];
}

/**
 * Extracts pagination metadata from the same response.
 * @param {Object} response
 * @returns {{ total: number, next_cursor: string|null, has_more: boolean }}
 */
export function extractMeta(response) {
  const data = response?.data?.data || response?.data || response || {};
  const meta = data.meta || {};
  return {
    total: meta.total || 0,
    nextCursor: meta.next_cursor || null,
    hasMore: meta.has_more !== undefined ? meta.has_more : false,
  };
}