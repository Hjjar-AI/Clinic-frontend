// frontend/src/features/auth/stores/auth.js
import { defineStore } from 'pinia'
import { computed,ref } from 'vue'

import { clearAllFormDrafts } from '@/composables/useFormDraft'
import authService from '@/features/auth/services/authService'
import { changeSession, sessionGeneration, sessionPrincipal } from '@/services/sessionState'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const sessionChecked = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  let previousUserId = null

  function reset() {
    previousUserId = user.value?.id || previousUserId
    changeSession(null)
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
        changeSession(authenticatedUser.id)
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

    let epoch = sessionGeneration()
    loading.value = true
    try {
      const data = await authService.getMe()
      if (epoch !== sessionGeneration()) return user.value
      if (data?.user && (data.user.id || data.user.username)) {
        if (sessionPrincipal() !== data.user.id) { changeSession(data.user.id); epoch = sessionGeneration() }
        user.value = data.user
        previousUserId = data.user.id
      } else {
        user.value = null
      }
      return data?.user || null
    } catch (error) {
      // A temporary network failure must not destroy an already established
      // session. A real 401 is handled centrally and calls reset().
      if (epoch === sessionGeneration() && (!user.value || error?.response?.status === 401)) user.value = null
      return user.value
    } finally {
      if (epoch === sessionGeneration()) { sessionChecked.value = true; loading.value = false }
    }
  }

  async function logout({ preserveDrafts = false } = {}) {
    try {
      await authService.logout()
    } catch {
      // Local session teardown still completes after a failed logout request.
    }
    previousUserId = user.value?.id || previousUserId
    changeSession(null)
    user.value = null
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
