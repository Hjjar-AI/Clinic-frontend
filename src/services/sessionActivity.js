import { ref } from 'vue'
import { onSessionChange } from '@/services/sessionState'
export const sessionExpiresAt = ref(0)
export function acceptSessionActivity(payload) {
  if (Number.isFinite(payload?.expires_at)) {
    const deadline = Number.isFinite(payload.server_now) ? Date.now() + Math.max(0, payload.expires_at - payload.server_now) * 1000 : payload.expires_at * 1000
    sessionExpiresAt.value = Math.max(sessionExpiresAt.value, deadline)
  }
}
onSessionChange(() => { sessionExpiresAt.value = 0 })
