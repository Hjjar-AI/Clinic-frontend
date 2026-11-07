// frontend/src/composables/useFormFieldProps.js
import { computed } from 'vue'

/**
 * Reusable props definition shared by FormInput, FormSelect, FormTextarea, etc.
 * Usage:
 *   const props = defineProps(useFormFieldProps())
 */
export function useFormFieldProps() {
  return {
    modelValue: { type: [String, Number], default: '' },
    label:        { type: String, default: '' },
    required:     { type: Boolean, default: false },
    error:        { type: String, default: '' },
    help:         { type: String, default: '' },
    fieldId:      { type: String, default: '' },
    disabled:     { type: Boolean, default: false },
  }
}

/**
 * Generates a stable field ID if none is provided.
 */
export function useFieldId(props) {
  return computed(() => props.fieldId || `field-${Math.random().toString(36).slice(2, 11)}`)
}