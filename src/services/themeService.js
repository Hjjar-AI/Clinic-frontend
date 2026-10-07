// frontend/src/services/themeService.js
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { DEFAULT_THEME } from '@/constants/theme'
import { safeGetItem, safeJsonParse,safeSetItem } from '@/utils/storage'

export function loadPreferences() {
  let prefs = {}
  try {
    const raw = safeGetItem(STORAGE_KEYS.PREFERENCES)
    if (raw) prefs = safeJsonParse(raw, {})
  } catch { /* ignore */ }

  // Migrate old keys
  const oldTheme = safeGetItem('clinic_theme')
  const oldDark = safeGetItem('clinic_dark_mode')
  if (!prefs.theme && oldTheme) prefs.theme = oldTheme
  if (prefs.darkMode === undefined && oldDark !== null) prefs.darkMode = oldDark === 'true'

  prefs.theme = prefs.theme || DEFAULT_THEME
  prefs.darkMode = prefs.darkMode || false

  if (oldTheme) safeSetItem('clinic_theme', null)
  if (oldDark) safeSetItem('clinic_dark_mode', null)

  savePreferences(prefs)
  return prefs
}

export function savePreferences({ theme, darkMode }) {
  const prefs = { theme: theme || DEFAULT_THEME, darkMode: darkMode || false }
  safeSetItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs))
}

export function applyThemeToBody(theme, darkMode) {
  document.body.className = document.body.className.replace(/theme-\S+/g, '').trim()
  if (theme && theme !== DEFAULT_THEME) {
    document.body.classList.add(`theme-${theme}`)
  }
  document.body.classList.toggle('dark-mode', darkMode)
}

export const themeService = {
  load: loadPreferences,
  save: savePreferences,
  apply: applyThemeToBody,
}