<template>
  <FormField
    :label="label"
    :required="required"
    :error="error"
    :help="help"
    :field-id="computedId"
    :valid="valid"
  >
    <input
      :id="computedId"
      v-model="modelValue"
      :type="type"
      :dir="controlDirection"
      class="form-control"
      :class="{
        'is-invalid': !!error,
        'is-valid': valid && !error
      }"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :aria-invalid="Boolean(error)"
      @blur="$emit('blur')"
    >
  </FormField>
</template>

<script setup>
import { computed, useId } from 'vue'

import FormField from './FormField.vue'

const props = defineProps({
  type: { type: String, default: 'text' },
  direction: { type: String, default: undefined, validator: value => ['rtl', 'ltr', 'auto'].includes(value) },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
  inputmode: { type: String, default: undefined },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  fieldId: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  valid: { type: Boolean, default: false }
})

const controlDirection = computed(() => props.direction || (['tel', 'email', 'url', 'number'].includes(props.type) ? 'ltr' : undefined))
const fallbackId = `input-${useId()}`
const computedId = computed(() => props.fieldId || fallbackId)

defineEmits(['blur'])
const modelValue = defineModel({ type: [String, Number], default: '' })
</script>
