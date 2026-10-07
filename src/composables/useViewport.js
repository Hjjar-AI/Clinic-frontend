// frontend/src/composables/useViewport.js
import { useBreakpoints } from '@vueuse/core'

/**
 * Tracks whether the viewport is mobile‑sized (< 768px).
 * Uses VueUse's useBreakpoints.
 * @returns {{ isMobile: import('vue').Ref<boolean> }}
 */
export function useViewport() {
  const breakpoints = useBreakpoints({
    mobile: 768,
  })

  const isMobile = breakpoints.smaller('mobile')

  return { isMobile }
}