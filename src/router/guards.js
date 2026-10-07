// frontend/src/router/guards.js
import { useCan } from '@/composables/useCan'
import { useAuthStore } from '@/features/auth/stores/auth'

export async function fetchMeGuard(to, from, next) {
  const authStore = useAuthStore()
  if ((to.meta.requiresAuth || to.meta.guestOnly) && !authStore.sessionChecked) {
    await authStore.fetchMe()
  }
  next()
}

export async function authGuard(to, from, next) {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    return next({ name: 'Login' })
  }
  if (authStore.isAuthenticated && to.meta.guestOnly) {
    return next({ name: 'Dashboard' })
  }
  next()
}

export async function permissionGuard(to, from, next) {
  const authStore = useAuthStore()
  const { can } = useCan()
  if (to.meta.permission && authStore.isAuthenticated) {
    if (!can(to.meta.permission)) {
      return next({ name: 'ErrorPage', query: { reason: 'permission' } })
    }
  }
  if (to.meta.role && authStore.isAuthenticated && authStore.user?.role !== to.meta.role) {
    return next({ name: 'ErrorPage', query: { reason: 'permission' } })
  }
  next()
}
