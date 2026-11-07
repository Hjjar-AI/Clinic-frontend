import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/auth'
export const useWorkspaceStore = defineStore('workspace', () => {
  const auth = useAuthStore()
  const preferences = ref({ density: 'comfortable', splitView: false, progressive: false })
  const key = computed(() => auth.user?.id ? `clinic:workspace:${auth.user.id}` : null)
  watch(key, storageKey => {
    let stored = {}
    try { stored = JSON.parse(storageKey && localStorage.getItem(storageKey)) || {} } catch { /* Defaults remain usable. */ }
    preferences.value = { density: stored.density === 'compact' ? 'compact' : 'comfortable', splitView: stored.splitView === true, progressive: stored.progressive === true }
  }, { immediate: true, flush: 'sync' })
  function update(patch) {
    const candidate = { ...preferences.value, ...patch }
    preferences.value = { density: candidate.density === 'compact' ? 'compact' : 'comfortable', splitView: candidate.splitView === true, progressive: candidate.progressive === true }
    try { if (key.value) localStorage.setItem(key.value, JSON.stringify(preferences.value)) } catch { /* Session preferences still work. */ }
  }
  return { preferences, update }
})
