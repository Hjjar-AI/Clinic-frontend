import { onBeforeUnmount } from 'vue'

/**
 * Collects cleanup functions (observers, listeners, timers)
 * and automatically calls them when the component unmounts.
 */
export function useAutoCleanup() {
  const cleanups = []

  function add(cleanupFn) {
    cleanups.push(cleanupFn)
  }

  onBeforeUnmount(() => {
    cleanups.forEach(fn => {
      try { fn() } catch { /* Cleanup is best-effort during teardown. */ }
    })
    cleanups.length = 0
  })

  return { add }
}
