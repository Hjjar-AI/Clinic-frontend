import { unwrapResponse } from '@/services/apiClient'

export function normalizeCursorResponse(
  response,
  { keys = ['items', 'results', 'data'], strict = false } = {},
) {
  const source = response ?? {},
    payload = unwrapResponse(source)
  let items = Array.isArray(payload) ? payload : undefined
  if (items === undefined) {
    for (const key of keys) {
      if (payload?.[key] !== undefined && payload[key] !== null) {
        items = payload[key]
        break
      }
    }
  }
  if (!Array.isArray(items)) {
    if (strict) throw new Error('Invalid catalog response')
    items = []
  }
  const meta =
    (!Array.isArray(payload) && payload?.meta) ||
    source.meta ||
    source.data?.meta ||
    {}
  const nextCursor =
    source.nextCursor ??
    source.next_cursor ??
    meta.next_cursor ??
    meta.nextCursor ??
    null
  const hasMore = source.hasMore ?? source.has_more ?? meta.has_more
  return {
    items,
    nextCursor,
    hasMore: hasMore == null ? Boolean(nextCursor) : Boolean(hasMore),
    total: source.total ?? meta.total,
  }
}
