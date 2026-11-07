// frontend/src/composables/useCan.js
import { useAuthStore } from '@/features/auth/stores/auth'

export function useCan() {
  const authStore = useAuthStore()

  function can(permission) {
    return authStore.can(permission)
  }

  return { can }
}