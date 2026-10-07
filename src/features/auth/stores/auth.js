// frontend/src/features/auth/stores/auth.js
import { defineStore } from 'pinia'
import { computed,ref } from 'vue'

import { clearAllFormDrafts } from '@/composables/useFormDraft'
import authService from '@/features/auth/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const sessionChecked = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  let previousUserId = null

  function reset() {
    previousUserId = user.value?.id || previousUserId
    user.value = null
    loading.value = false
    sessionChecked.value = true
  }

  async function login(username, password, remember = false) {
    loading.value = true
    try {
      const payload = await authService.login({ username, password, remember })
      const authenticatedUser = payload?.user ?? payload
      if (authenticatedUser && (authenticatedUser.id || authenticatedUser.username)) {
        if (previousUserId && authenticatedUser.id !== previousUserId) clearAllFormDrafts()
        user.value = authenticatedUser
        previousUserId = authenticatedUser.id
        sessionChecked.value = true
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMe({ force = false } = {}) {
    if (sessionChecked.value && !force) return user.value

    loading.value = true
    try {
      const data = await authService.getMe()
      if (data?.user) {
        user.value = data.user
      } else {
        user.value = null
      }
      return data?.user || null
    } catch (error) {
      // A temporary network failure must not destroy an already established
      // session. A real 401 is handled centrally and calls reset().
      if (!user.value || error?.response?.status === 401) user.value = null
      return user.value
    } finally {
      sessionChecked.value = true
      loading.value = false
    }
  }

  // NOTE: Previously this called `resetIdempotencyKey()` imported from
  // `apiClient`. That import created a cycle (apiClient ↔ authStore) and
  // the function was a no-op. Both have been removed — keys are managed
  // entirely inside apiClient now, so nothing needs to be reset here.
  //
  // The notifications store also no longer needs to be called from here:
  // it watches `authStore.isAuthenticated` directly and stops polling
  // when it flips to false. Keeping `auth` free of feature-level imports
  // makes it the cleanest foundation in the codebase.
  async function logout({ preserveDrafts = false } = {}) {
    try {
      await authService.logout()
    } catch (e) {
      console.warn('Logout API call failed:', e)
    }
    user.value = null
    previousUserId = null
    if (!preserveDrafts) clearAllFormDrafts()
    sessionChecked.value = true
  }

  async function changePassword(currentPassword, newPassword) {
    await authService.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    })
    if (user.value) {
      user.value.force_password_change = false
    }
    return true
  }

  function can(permission) {
    if (!user.value) return false
    if (user.value.role === 'admin') return true
    const perms = user.value.permissions || []
    return perms.includes(permission)
  }

  return {
    user,
    isAuthenticated,
    loading,
    sessionChecked,
    reset,
    login,
    logout,
    fetchMe,
    changePassword,
    can,
  }
})
