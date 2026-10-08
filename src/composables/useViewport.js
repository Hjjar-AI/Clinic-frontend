// frontend/src/composables/useViewport.js
import { useBreakpoints } from '@vueuse/core'

/**
 * Tracks the same inclusive mobile boundary as the styles (<= 768px).
 * Uses VueUse's useBreakpoints.
 * @returns {{ isMobile: import('vue').Ref<boolean> }}
 */
export function useViewport() {
  const breakpoints = useBreakpoints({
    mobile: 768,
  })

  const isMobile = breakpoints.smallerOrEqual('mobile')

  return { isMobile }
}