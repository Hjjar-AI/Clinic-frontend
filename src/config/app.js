// frontend/src/config/app.js
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { ALLOWED_THEMES,DEFAULT_THEME } from '@/constants/theme'

export const APP_CONFIG = {
  // Theme
  defaultTheme: DEFAULT_THEME,
  allowedThemes: ALLOWED_THEMES,

  // Storage keys (exposed for convenience)
  storageKeys: STORAGE_KEYS,

  // Feature flags
  features: {
    enableDemoData: import.meta.env.VITE_ENABLE_DEMO_DATA !== 'false',   // default true
    enableExperimentalCharts: import.meta.env.VITE_EXPERIMENTAL_CHARTS === 'true',
  },

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Misc
  appVersion: '2.0.0',
}