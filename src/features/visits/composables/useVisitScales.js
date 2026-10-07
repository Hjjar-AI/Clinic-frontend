// frontend/src/features/visits/composables/useVisitScales.js
import { ref, unref,watch } from 'vue'

import { useLookupStore } from '@/stores/lookups'

/**
 * Manages the dynamic list of clinical scales attached to a visit.
 *
 * Two fixes over the previous version:
 *
 * 1. `useLookupStore().scales` is a Vue ref. Calling `.find()` on it
 *    directly (as the original did) threw. We now `unref()` it.
 *
 * 2. `hydrateFromVisit` may run before `useSWR`-backed lookup queries
 *    resolve. In that window, `scaleDef` was `undefined`, so `fields`
 *    became `[]`, and the next `toPayload()` would submit empty
 *    responses for every scale — silently wiping prior answers. We now
 *    keep the raw `scale_responses` and re-hydrate whenever the lookup
 *    store's `scales` array changes.
 */
export function useVisitScales() {
  const lookupStore = useLookupStore()
  const showScalePicker = ref(false)
  const addedScales = ref([])

  // Raw responses from the server, kept so we can rebuild `addedScales`
  // once the lookup store finishes loading scale definitions.
  const rawResponses = ref([])

  function addScale() {
    showScalePicker.value = true
  }

  function onScaleSelected(scale) {
    if (!scale) return
    if (addedScales.value.some((item) => item.scale_id === scale.id)) {
      showScalePicker.value = false
      return
    }
    addedScales.value.push({
      scale_id: scale.id,
      scale_name: scale.name,
      name: scale.name, // UI alias
      fields: (scale.fields || []).map((f) => ({ ...f, value: f.default ?? 0 })),
    })
    showScalePicker.value = false
  }

  function removeScale(idx) {
    addedScales.value.splice(idx, 1)
  }

  function buildFromRaw() {
    const scaleList = unref(lookupStore.scales) || []

    addedScales.value = rawResponses.value.map((sr) => {
      const scaleDef = scaleList.find((s) => s.id === sr.scale_id)

      let responses = {}
      try {
        responses =
          typeof sr.responses_json === 'string'
            ? JSON.parse(sr.responses_json)
            : sr.responses_json || {}
      } catch {
        responses = {}
      }

      return {
        scale_id: sr.scale_id,
        scale_name: sr.scale_name_snapshot || scaleDef?.name || '',
        name: sr.scale_name_snapshot || scaleDef?.name || '',
        fields: (responses.__definition || scaleDef?.fields || []).map((f) => ({
          ...f,
          value: responses[f.id] ?? f.default ?? 0,
        })),
      }
    })
  }

  function hydrateFromVisit(data) {
    if (!data?.scale_responses?.length) {
      rawResponses.value = []
      addedScales.value = []
      return
    }
    rawResponses.value = data.scale_responses
    buildFromRaw()
  }

  // When the lookup store finishes loading scale definitions, rebuild
  // `addedScales` so per-field defaults and labels appear even if
  // `hydrateFromVisit` ran first.
  watch(
    () => unref(lookupStore.scales),
    () => {
      if (rawResponses.value.length) buildFromRaw()
    }
  )

  function toPayload() {
    return addedScales.value.map((scale) => ({
      scale_id: scale.scale_id,
      scale_name: scale.scale_name || scale.name || '',
      responses: {
        ...Object.fromEntries((scale.fields || []).map((f) => [String(f.id), f.value])),
        __definition: (scale.fields || []).map((f) => ({
          id: f.id,
          label: f.label,
          field_type: f.field_type,
          min_val: f.min_val,
          max_val: f.max_val,
          step: f.step,
          default: f.default,
          options: f.options,
          order: f.order,
        })),
      },
    }))
  }

  return {
    showScalePicker,
    addedScales,
    addScale,
    onScaleSelected,
    removeScale,
    hydrateFromVisit,
    toPayload,
  }
}
