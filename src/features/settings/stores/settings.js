// frontend/src/features/settings/stores/settings.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

import settingsService from '@/features/settings/services/settingsService'
import { unwrapResponse } from '@/services/apiClient'
import { themeService } from '@/services/themeService'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    clinic_name: '',
    clinic_address: '',
    clinic_phone: '',
    theme: 'default',
  })

  const loading = ref(false)
  const error = ref(null)

  function reset() {
    loading.value = false
    error.value = null
  }

  async function fetchSettings() {
    if (settings.value.clinic_name) return

    loading.value = true
    error.value = null

    try {
      const result = await settingsService.getSettings()
      const payload = unwrapResponse(result)

      if (payload && typeof payload === 'object') {
        settings.value = {
          ...settings.value,
          ...payload,
        }
      }
    } catch (e) {
      error.value = e?.message || 'فشل تحميل الإعدادات'
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(payload) {
    const updated = await settingsService.updateSettings(payload)

    settings.value = {
      ...settings.value,
      ...updated,
    }
  }

  async function setTheme(theme) {
    const updated = await settingsService.setTheme(theme)

    themeService.save({ theme, darkMode: false })
    themeService.apply(theme, false)

    settings.value = { ...settings.value, ...updated }
  }

  async function generateDemoData() {
    await settingsService.generateDemoData()
  }

  return {
    settings,
    loading,
    error,
    reset,
    fetchSettings,
    updateSettings,
    setTheme,
    generateDemoData,
  }
})