// frontend/src/composables/useTimeAgo.js
import { useDate } from '@/composables/useDate'

/**
 * Tiny composable that provides a `timeAgo` function for any component.
 * Uses the same underlying logic as `<RelativeDate>`.
 */
export function useTimeAgo() {
  const { timeAgo } = useDate()
  return { timeAgo }
}