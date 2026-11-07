// frontend/src/constants/storageKeys.js

export const STORAGE_KEYS = {
  PREFERENCES: 'clinic_preferences',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  DENSITY: 'clinic_density',
  RECENT_SEARCHES: 'clinic_recent_searches',
  DASHBOARD_NOTES: (userId) => `dashboard_notes_${userId || 'anonymous'}`,
}
