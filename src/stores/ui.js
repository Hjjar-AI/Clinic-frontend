// frontend/src/stores/ui.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useWorkspaceStore } from '@/stores/workspace'
import { themeService } from '@/services/themeService'

export const useUiStore = defineStore('ui', () => {
  // ── State ──────────────────────────────────────────────────────
  const prefs = themeService.load()

  const sidebarCollapsed = ref(false)      // will be hydrated by persist plugin
  const workspace = useWorkspaceStore()
  const density = computed(() => workspace.preferences.density)
  const theme = ref(prefs.theme || 'default')
  const darkMode = ref(prefs.darkMode || false)

  // ── Actions ────────────────────────────────────────────────────
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setDensity(value) {
    if (['comfortable', 'compact'].includes(value)) workspace.update({ density: value })
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    darkMode.value = false
    themeService.apply(newTheme, false)
    themeService.save({ theme: newTheme, darkMode: false })
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    themeService.apply(theme.value, darkMode.value)
    themeService.save({ theme: theme.value, darkMode: darkMode.value })
  }

  // ── Return ─────────────────────────────────────────────────────
  return {
    sidebarCollapsed,
    density,
    theme,
    darkMode,
    toggleSidebar,
    setDensity,
    setTheme,
    toggleDarkMode,
  }
}, {
  // ── Persist configuration ─────────────────────────────────────
  persist: {
    key: 'ui_store',
    paths: ['sidebarCollapsed'],
  },
})