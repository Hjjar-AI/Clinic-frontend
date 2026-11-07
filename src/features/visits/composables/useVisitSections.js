import { computed } from 'vue'

import { useWorkspaceStore } from '@/stores/workspace'

/** Visit progressive disclosure policy, independent of the shared card. */
export function useVisitSection(key) {
  const workspace = useWorkspaceStore()
  return computed(
    () =>
      !workspace.preferences.progressive ||
      ['visit-basic', 'visit-treat'].includes(key),
  )
}
