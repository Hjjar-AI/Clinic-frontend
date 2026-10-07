// frontend/src/composables/usePagination.js
import { computed,ref } from 'vue'

/**
 * Pagination composable.
 *
 * Supported modes:
 * - cursor: cursor-based infinite pagination.
 * - page: page-number pagination.
 * - array: client-side pagination.
 *
 * Cursor mode contract:
 * fetchFn receives: { cursor, limit, perPage }
 * fetchFn may return any of:
 *   - { data: [...], nextCursor, hasMore, total }
 *   - { items: [...], meta: { next_cursor, has_more, total } }
 *   - Axios response containing one of the above
 */
export function usePagination(options = {}) {
  const {
    fetchFn = null,
    perPage = 20,
    mode = 'cursor',
    items: itemsParam = null,
  } = options

  // ------------------------------------------------------------
  // Client-side array pagination
  // ------------------------------------------------------------
  if (mode === 'array') {
    const currentPage = ref(1)

    const totalPages = computed(() => {
      if (!itemsParam) return 1
      return Math.ceil(itemsParam.value.length / perPage) || 1
    })

    const pagedItems = computed(() => {
      if (!itemsParam) return []
      const start = (currentPage.value - 1) * perPage
      return itemsParam.value.slice(start, start + perPage)
    })

    const hasMore = computed(() => currentPage.value < totalPages.value)

    function next() {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    function prev() {
      if (currentPage.value > 1) currentPage.value--
    }

    function go(page) {
      const num = Number(page)
      if (Number.isNaN(num) || num < 1) currentPage.value = 1
      else if (num > totalPages.value) currentPage.value = totalPages.value
      else currentPage.value = num
    }

    return {
      items: pagedItems,
      pagedItems,
      loading: ref(false),
      loadingMore: ref(false),
      error: ref(null),
      hasMore,
      nextCursor: null,
      total: computed(() => itemsParam?.value?.length || 0),
      currentPage,
      totalPages,
      next,
      prev,
      go,
      loadNext: next,
      loadMore: next,
      refresh: async () => {},
    }
  }

  // ------------------------------------------------------------
  // Server-side cursor/page pagination
  // ------------------------------------------------------------
  const items = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref(null)
  const hasMore = ref(false)
  const nextCursor = ref(null)
  const total = ref(0)

  const currentPage = ref(1)
  const totalPages = ref(1)

  function normalizeResult(result) {
    const source = result || {}

    // Supports:
    // - raw Axios response
    // - already-unwrapped payload
    // - { data: [...] }
    // - { items: [...], meta: {...} }
    const payload = source?.data?.data ?? source?.data ?? source

    let list = []

    if (Array.isArray(payload)) {
      list = payload
    } else if (payload && typeof payload === 'object') {
      list = payload.items || payload.results || payload.data || []
    }

    if (!Array.isArray(list)) list = []

    const meta =
      (!Array.isArray(payload) && payload?.meta) ||
      source?.meta ||
      source?.data?.meta ||
      {}

    const normalizedNextCursor =
      source.nextCursor ??
      source.next_cursor ??
      meta.next_cursor ??
      meta.nextCursor ??
      null

    const rawHasMore =
      source.hasMore ??
      source.has_more ??
      meta.has_more

    const normalizedHasMore =
      rawHasMore !== undefined && rawHasMore !== null
        ? Boolean(rawHasMore)
        : Boolean(normalizedNextCursor)

    const normalizedTotal = source.total ?? meta.total ?? undefined

    return {
      items: list,
      nextCursor: normalizedNextCursor,
      hasMore: normalizedHasMore,
      total: normalizedTotal,
    }
  }

  async function loadCursor(cursor = null, { append = false } = {}) {
    if (!fetchFn) return

    if (append) {
      if (!hasMore.value || !nextCursor.value) return
      if (loading.value || loadingMore.value) return
    } else {
      if (loading.value) return
    }

    if (append) loadingMore.value = true
    loading.value = true
    error.value = null

    try {
      const rawResult = await fetchFn({
        cursor,
        limit: perPage,
        perPage,
      })

      const normalized = normalizeResult(rawResult)

      if (append) {
        items.value = [...items.value, ...normalized.items]
      } else {
        items.value = normalized.items
      }

      nextCursor.value = normalized.nextCursor || null
      hasMore.value = Boolean(normalized.hasMore)

      if (normalized.total !== undefined) {
        total.value = normalized.total
      }
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function loadPage(page = 1) {
    if (!fetchFn) return

    if (mode !== 'page') {
      await loadCursor(null, { append: false })
      return
    }

    loading.value = true
    error.value = null

    try {
      const rawResult = await fetchFn({
        page,
        limit: perPage,
        perPage,
      })

      const normalized = normalizeResult(rawResult)

      items.value = normalized.items
      currentPage.value = page

      if (normalized.total !== undefined) {
        total.value = normalized.total
        totalPages.value = Math.ceil(normalized.total / perPage) || 1
      } else {
        totalPages.value = 1
      }

      hasMore.value = currentPage.value < totalPages.value
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    if (mode === 'page') {
      await loadPage(1)
    } else {
      nextCursor.value = null
      hasMore.value = false
      await loadCursor(null, { append: false })
    }
  }

  async function loadNext() {
    if (mode === 'page') {
      if (currentPage.value < totalPages.value) {
        await loadPage(currentPage.value + 1)
      }
      return
    }

    await loadCursor(nextCursor.value, { append: true })
  }

  async function prev() {
    if (mode === 'page' && currentPage.value > 1) {
      await loadPage(currentPage.value - 1)
    }
  }

  async function go(page) {
    if (mode === 'page') {
      await loadPage(page)
    }
  }

  // Page-number mode can auto-load initial page.
  // Cursor mode should usually call refresh() explicitly from the view.
  if (mode === 'page' && fetchFn) {
    loadPage(1)
  }

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    nextCursor,
    total,
    currentPage,
    totalPages,
    refresh,
    loadNext,
    loadMore: loadNext,
    next: loadNext,
    prev,
    go,
  }
}