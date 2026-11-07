// frontend/src/bootstrap/registerApiHandlers.js
import authService from '@/features/auth/services/authService'
import { useAuthStore } from '@/features/auth/stores/auth'
import router from '@/router'
import { API_EVENTS,on } from '@/services/apiEvents'
import { useConfirmStore } from '@/stores/confirm'

/**
 * Wires up application-level side effects for API events.
 *
 * Called once from `main.js` after Pinia and the router are installed.
 * This is the ONLY place where the HTTP layer's semantic events are
 * translated into store/router actions — keeping `apiClient.js` free of
 * cross-cutting concerns and eliminating the previous
 * apiClient ↔ authStore cycle.
 */
export function registerApiHandlers() {
  // Re-entry guard for UNAUTHORIZED handling. `authService.logout()`
  // POSTs to the server; if that POST 401s (session already invalid),
  // the interceptor will emit UNAUTHORIZED again. Without this guard
  // the handler would call logout() in a loop.
  let handlingUnauthorized = false

  // 401: tear down local auth and bounce to login.
  on(API_EVENTS.UNAUTHORIZED, () => {
    const authStore = useAuthStore()
    const path = window.location.pathname
    const isOnLogin = path.startsWith('/login')

    // Clear local auth state immediately so the UI reflects the
    // logged-out status regardless of what happens next.
    authStore.reset()

    if (isOnLogin) {
      // 401 on the login page (bad credentials, or a stale request
      // from a previous session). Do NOT fire a logout POST — it would
      // 401 again and loop. The user's next login attempt clears state.
      return
    }

    if (handlingUnauthorized) return
    handlingUnauthorized = true

    // Best-effort server-side session cleanup. Errors are ignored; we
    // are already redirecting. `.finally` releases the guard once the
    // request settles, so a genuinely-expired session that produces a
    // fresh 401 later is still handled.
    authService.logout()
      .catch(() => { /* ignore */ })
      .finally(() => { handlingUnauthorized = false })

    router.push({
      name: 'Login',
      query: { session: 'expired', returnTo: router.currentRoute.value.fullPath },
    })
  })

  // 409: optimistic-lock conflict. Prompt the user, then re-render the
  // current route so the fresh version is loaded.
  on(API_EVENTS.CONFLICT, async () => {
    const confirmStore = useConfirmStore()
    const shouldRefresh = await confirmStore.confirm(
      'تم تعديل هذا السجل بواسطة مستخدم آخر. يرجى تحديث الصفحة للمشاهدة.',
      {
        confirmText: 'تحديث الصفحة',
        cancelText: 'إلغاء',
        headerVariant: 'warning',
      }
    )
    if (shouldRefresh) window.location.reload()
  })

  // Server signalled that our permission set changed; refresh the user.
  on(API_EVENTS.PERMISSIONS_UPDATED, () => {
    useAuthStore().fetchMe({ force: true }).catch(() => {})
  })
}
