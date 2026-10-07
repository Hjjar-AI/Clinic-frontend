// frontend/src/features/settings/stores/users.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

import userService from '@/features/settings/services/userService'

export const useUserStore = defineStore('users', () => {
  const items = ref([])           // all users (if needed)
  const current = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const doctors = ref([])         // ensure it's an array
  let doctorsLoaded = false

  function reset() {
    items.value = []
    current.value = null
    loading.value = false
    error.value = null
    doctors.value = []
    doctorsLoaded = false
  }

  async function fetchAll(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await userService.getAll(params)
      items.value = Array.isArray(data) ? data : (data?.users || [])
    } catch (e) {
      error.value = e.message || 'خطأ في تحميل المستخدمين'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    loading.value = true
    error.value = null
    try {
      const data = await userService.getById(id)
      current.value = data
      return data
    } catch (e) {
      error.value = e.message || 'خطأ في تحميل المستخدم'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    error.value = null
    try {
      const newItem = await userService.create(payload)
      items.value.push(newItem)
      return newItem
    } catch (e) {
      error.value = e.message || 'خطأ في الحفظ'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    error.value = null
    try {
      const updated = await userService.update(id, payload)
      const idx = items.value.findIndex(u => u.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (e) {
      error.value = e.message || 'خطأ في التحديث'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value = null
    try {
      await userService.delete(id)
      items.value = items.value.filter(u => u.id !== id)
      if (current.value?.id === id) current.value = null
    } catch (e) {
      error.value = e.message || 'خطأ في الحذف'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchDoctors() {
    if (doctorsLoaded) return doctors.value
    try {
      const data = await userService.getDoctors()
      doctors.value = Array.isArray(data)
        ? data
        : (data?.doctors || data?.users || [])
      doctorsLoaded = true
    } catch {
      doctors.value = []   // ensure array even on error
    }
    return doctors.value
  }

  return {
    items,
    current,
    loading,
    error,
    doctors,
    reset,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    fetchDoctors,
  }
})