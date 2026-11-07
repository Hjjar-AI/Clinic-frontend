import { normalizeCursorResponse } from '@/utils/cursorResponse'
/** Load a complete catalog through the existing cursor contract. */
export async function fetchCatalog(fetchPage, listKey = 'items') {
  const rows = [],
    cursors = new Set()
  let cursor
  do {
    const result = await fetchPage({
      per_page: 200,
      ...(cursor ? { cursor } : {}),
    })
    const page = normalizeCursorResponse(result, {
      keys: [listKey, 'items', 'results'],
      strict: true,
    })
    rows.push(...page.items)
    cursor = page.nextCursor
    if (cursor && cursors.has(cursor))
      throw new Error('Repeated catalog cursor')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return rows
}
