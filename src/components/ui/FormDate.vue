<template>
  <DatePicker
    v-model="modelValue"
    :label="label"
    :required="required"
    :error="error"
    :help="help"
    :field-id="fieldId"
    :disabled="disabled"
  />
</template>

<script setup>
import DatePicker from './DatePicker.vue'

defineProps({
  label:        { type: String, default: '' },
  required:     { type: Boolean, default: false },
  error:        { type: String, default: '' },
  help:         { type: String, default: '' },
  fieldId:      { type: String, default: '' },
  disabled:     { type: Boolean, default: false },
})

const modelValue = defineModel({ type: String, default: '' })
</script>
