// frontend/src/features/visits/composables/useVisitTemplates.js
import { onMounted,ref } from 'vue'
import { isRef } from 'vue'

import templateService from '@/features/clinical/services/templateService'

/**
 * Loads the list of clinical note templates and applies one to a form.
 *
 * `applyTemplate` accepts either a plain reactive object OR a ref. Callers
 * that use `useVisitForm` pass a reactive object (from `useForm`), while
 * callers that use a plain `ref({...})` pass a ref. The previous
 * implementation assumed a ref unconditionally and did
 * `Object.assign(form.value, …)`, which silently no-op'd on reactive
 * objects and threw on refs whose `.value` was `undefined`.
 */
export function useVisitTemplates() {
  const templates = ref([])

  onMounted(async () => {
    try {
      const payload = await templateService.getAll()
      // `payload` is already unwrapped by the service layer.
      if (Array.isArray(payload)) {
        templates.value = payload
      } else if (payload && typeof payload === 'object') {
        templates.value = payload.items || payload.templates || []
      }
    } catch {
      templates.value = []
    }
  })

  function applyTemplate(form, templateId) {
    const t = templates.value.find((tpl) => tpl.id === templateId)
    if (!t) return

    const target = isRef(form) ? form.value : form
    if (!target || typeof target !== 'object') return

    const content = t.content || {}
    const formulation = content.formulation || {}

    // Only overwrite fields the template actually supplies. Fields the
    // template leaves blank keep whatever the user already typed.
    const updates = {
      mse: content.mse,
      formulation_predisposing: formulation.predisposing,
      formulation_precipitating: formulation.precipitating,
      formulation_perpetuating: formulation.perpetuating,
      formulation_protective: formulation.protective,
      risk_notes: content.risk_notes,
      treatment_text: content.treatment_text,
      doctor_notes: content.doctor_notes,
    }

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== null && value !== '') {
        target[key] = value
      }
    }

    // Persist provenance and the exact applied content. Later edits to the
    // template cannot mutate this visit, and administrators can see reliable
    // historical usage before retiring a template.
    target.clinical_data = {
      ...(target.clinical_data || {}),
      applied_template: {
        id: t.id,
        name: t.name,
        updated_at: t.updated_at,
        content: JSON.parse(JSON.stringify(content)),
      },
    }
  }

  return { templates, applyTemplate }
}
