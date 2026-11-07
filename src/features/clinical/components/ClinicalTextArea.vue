<template>
  <FormTextarea
    :model-value="modelValue"
    :label="label"
    :required="required"
    :error="error"
    :help="help"
    :field-id="fieldId"
    :rows="rows"
    :placeholder="placeholder"
    :maxlength="maxlength"
    @update:model-value="updateValue"
  />
</template>

<script setup>
import FormTextarea from '@/components/ui/FormTextarea.vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  fieldId: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
  maxlength: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue'])

function updateValue(val) {
  emit('update:modelValue', val)
}
</script>
