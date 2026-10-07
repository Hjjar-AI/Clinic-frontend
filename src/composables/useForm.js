// frontend/src/composables/useForm.js
import { useForm as useVeeForm, useIsFormDirty } from 'vee-validate'
import { computed, reactive, ref, toRaw,watch } from 'vue'
import * as yup from 'yup'

/**
 * Detects a Yup schema by duck-typing the public API. This lets `useForm`
 * accept either a Yup schema directly (`yup.object({...})`) or an array of
 * rule objects (`[{ field, required, … }]`).
 */
function isYupSchema(s) {
  return (
    s &&
    typeof s === 'object' &&
    (typeof s.validate === 'function' || typeof s.validateSync === 'function')
  )
}

function buildYupSchema(schemaRules) {
  const shape = {}

  for (const rule of schemaRules) {
    if (!rule || !rule.field) {
      if (import.meta.env.DEV) {
        console.warn('[useForm] skipping malformed schema rule:', rule)
      }
      continue
    }

    let fieldSchema = yup.mixed()

    if (rule.required) {
      const msg = rule.message || `${rule.label || rule.field} مطلوب`
      fieldSchema = fieldSchema.test('required', msg, (value) => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string' && value.trim() === '') return false
        if (Array.isArray(value) && value.length === 0) return false
        return true
      })
    }

    if (rule.minLength !== undefined) {
      const msg =
        rule.message ||
        `${rule.label || rule.field} يجب أن يحتوي على ${rule.minLength} أحرف على الأقل`
      fieldSchema = fieldSchema.test('minLength', msg, (value) => {
        if (value === null || value === undefined || value === '') return true
        return String(value).length >= rule.minLength
      })
    }

    if (rule.min !== undefined) {
      const msg =
        rule.message ||
        `${rule.label || rule.field} يجب أن يكون أكبر من أو يساوي ${rule.min}`
      fieldSchema = fieldSchema.test('min', msg, (value) => {
        if (value === null || value === undefined || value === '') return true
        const n = Number(value)
        if (Number.isNaN(n)) return false
        return n >= rule.min
      })
    }

    if (rule.max !== undefined) {
      const msg =
        rule.message ||
        `${rule.label || rule.field} يجب أن يكون أقل من أو يساوي ${rule.max}`
      fieldSchema = fieldSchema.test('max', msg, (value) => {
        if (value === null || value === undefined || value === '') return true
        const n = Number(value)
        if (Number.isNaN(n)) return false
        return n <= rule.max
      })
    }

    if (rule.pattern) {
      const msg = rule.message || `${rule.label || rule.field} غير صالح`
      fieldSchema = fieldSchema.test('pattern', msg, (value) => {
        if (value === null || value === undefined || value === '') return true
        return rule.pattern.test(String(value))
      })
    }

    if (rule.custom) {
      const msg = rule.message || 'قيمة غير صالحة'
      fieldSchema = fieldSchema.test('custom', msg, (value) => {
        const result = rule.custom(value)
        if (typeof result === 'string' && result.length > 0) {
          return new yup.ValidationError(result)
        }
        return true
      })
    }

    shape[rule.field] = fieldSchema
  }

  return yup.object().shape(shape)
}

export function useForm(initialData, { schema = null, validateOn = 'blur' } = {}) {
  let validationSchema = null

  if (schema) {
    if (isYupSchema(schema)) {
      validationSchema = schema
    } else if (Array.isArray(schema)) {
      validationSchema = buildYupSchema(schema)
    } else {
      throw new Error(
        'useForm: `schema` must be a Yup schema or an array of rule objects.'
      )
    }
  }

  const form = reactive({ ...initialData })
  const initialSnapshot = structuredClone(toRaw(form))

  const veeForm = useVeeForm({
    validationSchema,
    initialValues: initialData,
  })

  const fieldErrors = reactive({})
  const fieldStates = reactive({})

  watch(
    form,
    (newVal) => {
      veeForm.setValues(newVal)
    },
    { deep: true, immediate: true }
  )

  watch(
    () => veeForm.errors.value,
    (errors) => {
      for (const key of Object.keys(fieldErrors)) {
        if (!(key in errors)) fieldErrors[key] = ''
      }
      for (const [key, msg] of Object.entries(errors)) {
        fieldErrors[key] = msg || ''
        fieldStates[key] = msg ? 'invalid' : 'valid'
      }
    },
    { deep: true, immediate: true }
  )

  const isDirty = useIsFormDirty()
  function validateField(fieldName) {
    return veeForm.validateField(fieldName)
  }

  async function validate() {
    const result = await veeForm.validate()
    return result.valid
  }

  /**
   * Sets a server-supplied error on a specific field. The `errors`
   * computed below is read-only, so callers use this instead of writing
   * `errors[field] = msg` (which Vue rejects in dev).
   */
  function setFieldError(fieldName, message) {
    veeForm.setFieldError(fieldName, message)
  }

  /**
   * Merges a map of { fieldName: message } into VeeValidate's errors.
   */
  function setErrors(errorsMap) {
    veeForm.setErrors(errorsMap)
  }

  function clearErrors() {
    for (const key of Object.keys(fieldErrors)) fieldErrors[key] = ''
    for (const key of Object.keys(fieldStates)) fieldStates[key] = ''
    veeForm.setErrors({})
  }

  function scrollToFirstError() {
    const firstErrorField = document.querySelector('.is-invalid, .field-error')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const input = firstErrorField.closest('.form-group')?.querySelector('input, select, textarea')
      if (input) {
        input.focus()
        input.classList.add('shake')
        setTimeout(() => input.classList.remove('shake'), 600)
      }
    }
  }

  const isSubmitting = ref(false)
  function setSubmitting(val) {
    isSubmitting.value = val
  }

  /**
   * Reverts the form to the snapshot captured at construction time and
   * clears the dirty flag.
   */
  function resetForm() {
    const snapshot = structuredClone(toRaw(initialSnapshot))
    veeForm.resetForm({ values: snapshot })
    Object.assign(form, snapshot)
    clearErrors()
  }

  /**
   * Records the *current* values as the new baseline and clears the dirty
   * flag, without changing what the user sees. Forms call this after a
   * successful save instead of assigning to `isDirty` (which is a
   * read-only computed).
   */
  function markClean() {
    const snapshot = structuredClone(toRaw(form))
    veeForm.resetForm({ values: snapshot })
  }

  function markDirty() {
    // Kept for API compatibility. VeeValidate tracks dirty state
    // automatically; callers should rely on the returned `isDirty`.
  }

  const errors = computed(() => veeForm.errors.value)
  const lastSaved = ref(null)

  return {
    form,
    errors,
    fieldStates,
    isDirty,
    isSubmitting,
    lastSaved,
    validate,
    validateField,
    setFieldError,
    setErrors,
    handleBlur: (fieldName) => {
      if (validateOn === 'blur') validateField(fieldName)
    },
    clearErrors,
    scrollToFirstError,
    setSubmitting,
    resetForm,
    markClean,
    markDirty,
  }
}
