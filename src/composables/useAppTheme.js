// frontend/src/composables/useAppTheme.js
import { computed, onMounted, ref, watch } from 'vue'

import { useSettingsStore } from '@/features/settings/stores/settings'
import { themeService } from '@/services/themeService'

export function useAppTheme() {
  const settingsStore = useSettingsStore()
  const prefs = themeService.load()
  const dark = ref(prefs.darkMode)
  const theme = ref(prefs.theme)

  function applyTheme() {
    themeService.apply(theme.value, dark.value)
  }

  function persist() {
    themeService.save({ theme: theme.value, darkMode: dark.value })
  }

  onMounted(() => applyTheme())

  watch(() => settingsStore.settings.theme, (newTheme) => {
    if (newTheme && newTheme !== theme.value) {
      theme.value = newTheme
      dark.value = false
      applyTheme()
      persist()
    }
  })

  function toggleDark() {
    dark.value = !dark.value
    applyTheme()
    persist()
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    dark.value = false
    applyTheme()
    persist()
    settingsStore.setTheme(newTheme)
  }

  const darkIcon = computed(() => dark.value ? 'sun' : 'moon')

  return { dark, darkIcon, toggleDark, setTheme, theme }
}