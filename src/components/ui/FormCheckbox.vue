<template>
  <FormField
    :error="error"
    :field-id="computedId"
  >
    <label
      class="checkbox"
      :for="computedId"
    >
      <input
        :id="computedId"
        v-model="modelValue"
        type="checkbox"
        class="checkbox__input"
        :disabled="disabled"
      >
      {{ label }}
    </label>
  </FormField>
</template>

<script setup>
import { computed, useId } from 'vue'

import FormField from './FormField.vue'

const props = defineProps({
  label:        { type: String, default: '' },
  error:        { type: String, default: '' },
  fieldId:      { type: String, default: '' },
  disabled:     { type: Boolean, default: false },
})

const fallbackId = `checkbox-${useId()}`
const computedId = computed(() => props.fieldId || fallbackId)
const modelValue = defineModel({ type: Boolean, default: false })
</script>
