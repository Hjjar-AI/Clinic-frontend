import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useSelectionStore = defineStore('selection', () => {
  const selectedIds = reactive([])

  function toggle(id) {
    const index = selectedIds.indexOf(id)
    if (index !== -1) {
      selectedIds.splice(index, 1)
    } else {
      selectedIds.push(id)
    }
  }

  function selectAll(ids) {
    selectedIds.splice(0, selectedIds.length, ...ids)
  }

  function clearAll() {
    selectedIds.splice(0, selectedIds.length)
  }

  const isSelected = (id) => selectedIds.includes(id)

  const count = () => selectedIds.length

  return { selectedIds, toggle, selectAll, clearAll, isSelected, count }
})