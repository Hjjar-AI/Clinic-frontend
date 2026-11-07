<template>
  <ApiSelect
    :model-value="modelValue"
    url="/auth/users/doctors/"
    value-key="id"
    label-key="full_name"
    :placeholder="field.placeholder || 'اختر الطبيب'"
    label=""
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import ApiSelect from '@/components/ui/ApiSelect.vue'

defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number], default: '' },
})

defineEmits(['update:modelValue'])
</script>