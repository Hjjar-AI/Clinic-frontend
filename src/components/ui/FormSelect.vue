<template>
  <FormField
    :label="label"
    :required="required"
    :error="error"
    :help="help"
    :field-id="computedId"
    :valid="valid"
  >
    <select
      :id="computedId"
      v-model="modelValue"
      class="form-control form-control--select"
      :class="{
        'is-invalid': !!error,
        'is-valid': valid && !error
      }"
      :disabled="disabled"
      :required="required"
      :aria-invalid="Boolean(error)"
    >
      <option
        v-if="placeholder"
        value=""
        disabled
      >
        {{ placeholder }}
      </option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </FormField>
</template>

<script setup>
import { computed, useId } from 'vue'

import FormField from './FormField.vue'

const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  fieldId: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  valid: { type: Boolean, default: false }
})

const fallbackId = `select-${useId()}`
const computedId = computed(() => props.fieldId || fallbackId)

const modelValue = defineModel({ type: [String, Number], default: '' })
</script>
