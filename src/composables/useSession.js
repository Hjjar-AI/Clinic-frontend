import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoCleanup } from '@/composables/useAutoCleanup'
import { useAuthStore } from '@/features/auth/stores/auth'
import authService from '@/features/auth/services/authService'
import { acceptSessionActivity, sessionExpiresAt } from '@/services/sessionActivity'
import { sessionGeneration } from '@/services/sessionState'

export function useSession() {
  const isBlurred = ref(false)
  const showTimeoutWarning = ref(false)
  const secondsRemaining = ref(60)
  const auth = useAuthStore()
  const router = useRouter()
  const { add } = useAutoCleanup()
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('clinic-session-activity') : null
  let lastSent = 0
  let lastHuman = 0
  let pending = false
  let expiring = false
  let debounceTimer

  async function renew() {
    if (!auth.isAuthenticated || pending || document.hidden || !lastHuman || Date.now() - lastSent < 60000) return
    const epoch = sessionGeneration()
    pending = true
    lastSent = Date.now()
    try {
      const payload = await authService.activity()
      if (epoch !== sessionGeneration()) return
      acceptSessionActivity(payload)
      channel?.postMessage({ owner: auth.user.id, expires_at: sessionExpiresAt.value / 1000, sent: lastSent })
    } catch { /* API errors distinguish expired authentication from unavailable network. */ }
    finally { pending = false }
  }
  function humanActivity(event) {
    if (event && !event.isTrusted) return
    lastHuman = Date.now()
    if (Date.now() - lastSent >= 60000) renew()
    else {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        if (Date.now() - lastHuman < 60000) renew()
      }, Math.max(1, 60000 - (Date.now() - lastSent)))
    }
  }
  if (channel) channel.onmessage = ({ data }) => {
    if (auth.isAuthenticated && data?.owner === auth.user.id && Number.isFinite(data.expires_at)) {
      if (data.expires_at * 1000 > sessionExpiresAt.value) acceptSessionActivity(data)
      lastSent = Math.max(lastSent, Number(data.sent) || 0)
    }
  }
  const events = ['pointerdown', 'keydown', 'touchstart', 'scroll']
  for (const event of events) window.addEventListener(event, humanActivity, { passive: true })
  function visibility() { if (document.hidden) isBlurred.value = true }
  document.addEventListener('visibilitychange', visibility)
  const timer = setInterval(() => {
    if (!auth.isAuthenticated || !sessionExpiresAt.value) { showTimeoutWarning.value = false; return }
    const remaining = Math.ceil((sessionExpiresAt.value - Date.now()) / 1000)
    secondsRemaining.value = Math.max(0, remaining)
    showTimeoutWarning.value = remaining <= 60
    if (remaining <= 0 && !expiring) {
      expiring = true
      const returnTo = router.currentRoute.value.fullPath
      auth.logout({ preserveDrafts: true }).finally(() => {
        router.push({ name: 'Login', query: { session: 'expired', returnTo } })
        expiring = false
      })
    }
  }, 1000)
  watch(() => auth.user?.id, () => { lastHuman = 0; lastSent = Date.now(); clearTimeout(debounceTimer) })
  add(() => {
    clearInterval(timer)
    clearTimeout(debounceTimer)
    for (const event of events) window.removeEventListener(event, humanActivity)
    document.removeEventListener('visibilitychange', visibility)
    channel?.close()
  })
  return { isBlurred, showTimeoutWarning, secondsRemaining, dismissWarning: () => humanActivity() }
}
