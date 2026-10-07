// frontend/src/features/backup/stores/backup.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

import backupService from '@/features/backup/services/backupService'

export const useBackupStore = defineStore('backup', () => {
  const loading = ref(false)
  const error = ref(null)

  function reset() {
    loading.value = false
    error.value = null
  }

  async function createBackup(type) {
    loading.value = true
    error.value = null
    try {
      const res = await backupService.createBackup(type)
      return res
    } catch (e) {
      error.value = e.message || 'فشل النسخ الاحتياطي'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function previewRestore(file) {
    loading.value = true
    error.value = null
    try {
      const data = await backupService.previewRestore(file)
      return data
    } catch (e) {
      error.value = e.message || 'فشل المعاينة'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function executeRestore(options) {
    loading.value = true
    error.value = null
    try {
      await backupService.executeRestore(options)
    } catch (e) {
      error.value = e.message || 'فشل الاستعادة'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, reset, createBackup, previewRestore, executeRestore }
})