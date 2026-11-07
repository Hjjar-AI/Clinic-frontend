import { normalizeCursorResponse } from '@/utils/cursorResponse'
// frontend/src/utils/listFetch.js
/**
 * Factory that produces a standard cursor-paginated fetchFn for <ListView>.
 *
 * Extracts the ~40 lines of duplicated boilerplate that used to live in every
 * list view (VisitsList, InvoicesList, ...): request-param assembly, response
 * unwrapping, list extraction, and meta normalisation.
 *
 * The returned function is passed straight into <ListView :fetch-fn="...">.
 *
 * @param {{ getAll: (params: object) => Promise<any> }} service
 * @param {object} [options]
 * @param {string}   [options.listKey='items']  Preferred key inside the payload.
 * @param {Function} [options.getParams]        (filters) => extra query params.
 * @param {Function} [options.transform]        (list) => list, applied after extraction.
 * @returns {(args: { cursor?: string, limit?: number, filters?: object, sort?: object }) => Promise<{
 *   data: any[], nextCursor: string|null, hasMore: boolean, total: number|undefined
 * }>}
 */
export function makeCursorFetchFn(
  service,
  {
    listKey = 'items',
    getParams = () => ({}),
    transform = (list) => list,
  } = {},
) {
  return async ({ cursor, limit, filters, sort } = {}) => {
    const params = { ...getParams(filters) }
    if (limit) params.per_page = limit
    if (cursor) params.cursor = cursor
    if (sort?.sort_by) {
      params.sort_by = sort.sort_by
      params.sort_order = sort.sort_order || 'asc'
    }

    const result = await service.getAll(params)
    const { items, nextCursor, hasMore, total } = normalizeCursorResponse(
      result,
      { keys: [listKey, 'items', 'results'] },
    )
    return { data: transform(items), nextCursor, hasMore, total }
  }
}
