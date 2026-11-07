// frontend/src/composables/useSort.js
import { ref } from 'vue'

import { announce } from '@/utils/announce'

export function useSort() {
  const sortKey = ref('')
  const sortDirection = ref('asc')

  function toggleSort(key) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
    announce(`تم الترتيب حسب ${sortKey.value} ${sortDirection.value === 'asc' ? 'تصاعدياً' : 'تنازلياً'}`)
  }

  /** Client‑side sorting helper (used when server sorting is not available) */
  function sortedItems(items) {
    if (!sortKey.value) return items
    const direction = sortDirection.value
    const sorted = [...items].sort((a, b) => {
      let aVal = a[sortKey.value]
      let bVal = b[sortKey.value]
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  /** Server‑side sorting params helper – sends sort_by / sort_order */
  function getSortParams() {
    if (!sortKey.value) return {}
    return { sort_by: sortKey.value, sort_order: sortDirection.value }
  }

  return { sortKey, sortDirection, toggleSort, sortedItems, getSortParams }
}