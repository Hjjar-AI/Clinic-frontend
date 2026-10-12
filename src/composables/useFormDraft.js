import { ref, shallowRef, watch } from 'vue'
import { sessionPrincipal } from '@/services/sessionState'

export const SAFE_DRAFT_FIELDS = [
  'visit_date',
  'accompanied_by',
  'companion_relation',
  'clinical_status',
  'pain_level',
  'anxiety_level',
  'follow_up_date',
  'level_of_care',
  'follow_up_type',
  'date_signed',
  'diagnosis_discussed',
  'plan_discussed',
  'selectedTemplate',
]

const memoryDrafts = new Map()

export function clearAllFormDrafts() {
  memoryDrafts.clear()
}

export function useFormDraft({ safeDraftFields = null } = {}) {
  const draft = shallowRef({})
  // Callers hydrate server data and restore any existing draft before
  // enabling writes. This prevents the blank initial form from replacing a
  // valid draft during setup.
  const paused = ref(true)
  const owner = sessionPrincipal()
  const draftKey = `${owner}:${window.location.href}`

  function saveDraft() {
    if (owner == null || owner !== sessionPrincipal() || paused.value || !draft.value || Object.keys(draft.value).length === 0) return

    const value = Array.isArray(safeDraftFields)
      ? Object.fromEntries(
          safeDraftFields
            .filter(key => key in draft.value)
            .map(key => [key, draft.value[key]])
        )
      : { ...draft.value }

    if (Object.keys(value).length) memoryDrafts.set(draftKey, value)
  }

  function restoreDraftToForm() {
    if (owner == null || owner !== sessionPrincipal()) return null
    const restored = memoryDrafts.get(draftKey)
    if (!restored) return null
    memoryDrafts.delete(draftKey)
    return { ...restored }
  }

  function clearDraft() {
    memoryDrafts.delete(draftKey)
    draft.value = {}
  }

  function pauseDraft() {
    paused.value = true
  }

  function resumeDraft() {
    paused.value = false
    saveDraft()
  }

  watch(draft, saveDraft, { deep: true, flush: 'post' })

  return {
    draft,
    restoreDraftToForm,
    clearDraft,
    pauseDraft,
    resumeDraft,
  }
}
