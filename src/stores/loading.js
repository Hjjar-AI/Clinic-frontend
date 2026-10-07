import { defineStore } from 'pinia'
import { computed,ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const requestCount = ref(0)
  const visible = ref(false)
  let pendingTimer = null

  function start() {
    requestCount.value += 1
    // Only show spinner after 200ms of continuous loading
    if (!pendingTimer) {
      pendingTimer = setTimeout(() => {
        visible.value = true
        pendingTimer = null
      }, 200)
    }
  }

  function stop() {
    requestCount.value = Math.max(0, requestCount.value - 1)
    if (requestCount.value === 0) {
      if (pendingTimer) {
        clearTimeout(pendingTimer)
        pendingTimer = null
      }
      visible.value = false
    }
  }

  const isLoading = computed(() => visible.value)

  return { isLoading, start, stop }
})
