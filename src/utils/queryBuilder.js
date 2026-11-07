// frontend/src/utils/queryBuilder.js

/**
 * Builds a standardised query‑params object for API requests.
 * Standardised on 'cursor' for pagination cursor.
 *
 * @param {Object} options
 * @param {Object} [options.filters] – key/value filter pairs
 * @param {Object} [options.sort]    – { sort_by, sort_order }
 * @param {Number} [options.cursor]  – cursor for keyset pagination (standardised name)
 * @param {Number} [options.limit]   – per_page limit
 * @returns {Object}
 */
export function buildQuery({ filters = {}, sort = {}, cursor = null, limit = 20 } = {}) {
  const params = {}

  // Copy non‑empty filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value
    }
  })

  if (sort.sort_by) {
    params.sort_by = sort.sort_by
    params.sort_order = sort.sort_order || 'asc'
  }

  if (cursor) {
    params.cursor = cursor   // standardised
  }

  params.per_page = limit

  return params
}

/**
 * Convenience helper that also adds a search term.
 */
export function buildSearchQuery({ search = '', filters = {}, ...rest } = {}) {
  const params = buildQuery({ filters, ...rest })
  if (search) {
    params.search = search
  }
  return params
}