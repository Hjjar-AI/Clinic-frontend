/** Load a complete catalog through the existing cursor contract. */
export async function fetchCatalog(fetchPage, listKey = 'items') {
  const rows = [], cursors = new Set()
  let cursor
  do {
    const result = await fetchPage({ per_page: 200, ...(cursor ? { cursor } : {}) })
    const payload = result?.data?.data ?? result?.data ?? result
    const list = Array.isArray(payload) ? payload : payload?.[listKey] ?? payload?.items ?? payload?.results
    if (!Array.isArray(list)) throw new Error('Invalid catalog response')
    rows.push(...list)
    const meta = payload?.meta ?? result?.meta ?? result?.data?.meta ?? {}
    cursor = meta.next_cursor
    if (cursor && cursors.has(cursor)) throw new Error('Repeated catalog cursor')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return rows
}
