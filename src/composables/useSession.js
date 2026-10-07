// frontend/src/composables/useSession.js
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAutoCleanup } from '@/composables/useAutoCleanup'
import { useSystemConfig } from '@/composables/useSystemConfig'
import { useAuthStore } from '@/features/auth/stores/auth'

/**
 * Field allow-list for the visit form's draft. Only these keys survive a
 * session-crash save / restore cycle. The list is deliberately narrow:
 * clinical narrative fields (`mse`, `treatment_text`, `doctor_notes`, the
 * formulation block, etc.) are *not* included, so a crash never leaves
 * partially-typed PHI sitting in memory beyond the current page session.
 *
 * This constant is exported so callers (see `useVisitForm`) can pass it back
 * in via the `safeDraftFields` option. It is *not* applied as a default,
 * because forms like AppointmentForm and PatientForm have different field
 * shapes and previously lost their entire draft to this filter.
 */
/**
 * @param {number} timeoutMinutesFallback – Session lifetime in minutes
 *   when `/system/config` hasn't loaded yet.
 * @param {object} [options]
 * @param {string[]|null} [options.safeDraftFields=null]
 *   When provided, `saveDraft` keeps only the keys in this list. When
 *   `null`/`undefined`, the whole form value is persisted as-is.
 *   Default is `null` (no filter) so forms without a curated allow-list
 *   still get working drafts.
 */
export function useSession(timeoutMinutesFallback = 30) {
  const isBlurred = ref(false)
  const showTimeoutWarning = ref(false)
  const secondsRemaining = ref(60)
  const router = useRouter()
  const authStore = useAuthStore()
  const { config } = useSystemConfig()

  const { add } = useAutoCleanup()

  let warningTimer = null
  let logoutTimer = null
  let countdownTimer = null

  function getTimeoutSeconds() {
    return Math.max(1, Number(config.value?.session_lifetime) || timeoutMinutesFallback * 60)
  }

  function clearTimers() {
    clearTimeout(warningTimer)
    clearTimeout(logoutTimer)
    clearInterval(countdownTimer)
  }
  add(clearTimers)

  function startTimers() {
    if (!authStore.isAuthenticated) return
    const timeoutSeconds = getTimeoutSeconds()
    const warningSeconds = Math.min(60, timeoutSeconds)
    const warningMs = (timeoutSeconds - warningSeconds) * 1000
    const logoutMs = timeoutSeconds * 1000

    warningTimer = setTimeout(() => {
      showTimeoutWarning.value = true
      secondsRemaining.value = warningSeconds
      countdownTimer = setInterval(() => {
        if (secondsRemaining.value > 0) secondsRemaining.value--
        else clearInterval(countdownTimer)
      }, 1000)
    }, warningMs)

    logoutTimer = setTimeout(() => {
      const returnTo = router.currentRoute.value.fullPath
      authStore.logout({ preserveDrafts: true })
      router.push({ name: 'Login', query: { session: 'expired', returnTo } })
    }, logoutMs)
  }

  function resetTimers() {
    clearTimers()
    showTimeoutWarning.value = false
    startTimers()
  }

  let lastReset = 0
  function throttledReset() {
    const now = Date.now()
    if (now - lastReset >= 10000) {
      lastReset = now
      resetTimers()
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      isBlurred.value = true
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  add(() => document.removeEventListener('visibilitychange', handleVisibilityChange))

  const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
  events.forEach((e) => window.addEventListener(e, throttledReset, { passive: true }))
  add(() => events.forEach((e) => window.removeEventListener(e, throttledReset)))

  function dismissWarning() {
    showTimeoutWarning.value = false
    clearInterval(countdownTimer)
    resetTimers()
  }

  // Draft ownership/cleanup is handled by the auth store. Safe in-memory
  // drafts survive an expired session for the same user, but are cleared on
  // explicit logout or when another user signs in.
  watch(
    () => authStore.isAuthenticated,
    (val) => {
      if (val) {
        startTimers()
      } else {
        clearTimers()
      }
    }
  )

  watch(
    () => config.value?.session_lifetime,
    (value, previous) => {
      if (value && value !== previous && authStore.isAuthenticated) resetTimers()
    }
  )

  if (authStore.isAuthenticated) {
    startTimers()
  }

  return {
    isBlurred,
    showTimeoutWarning,
    secondsRemaining,
    dismissWarning,
  }
}
