import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRefreshStore = defineStore('refresh', () => {
  const lastUpdated = ref(null)

  function touch() {
    lastUpdated.value = new Date()
  }

  return { lastUpdated, touch }
})