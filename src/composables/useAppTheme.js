import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'
import { themeService } from '@/services/themeService'
export function useAppTheme() {
  const ui = useUiStore()
  const { theme, darkMode: dark } = storeToRefs(ui)
  onMounted(() => themeService.apply(theme.value, dark.value))
  return { theme, dark, darkIcon: computed(() => dark.value ? 'sun' : 'moon'), toggleDark: ui.toggleDarkMode, setTheme: ui.setTheme }
}