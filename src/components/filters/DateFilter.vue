<template>
  <FormField
    :label="field.placeholder || ''"
    :field-id="`filter-${field.key}`"
  >
    <div class="flex flex--gap-2">
      <DatePicker
        :model-value="startDate"
        label=""
        placeholder="من"
        @update:model-value="onStartChange"
      />
      <DatePicker
        :model-value="endDate"
        label=""
        placeholder="إلى"
        @update:model-value="onEndChange"
      />
    </div>
  </FormField>
</template>

<script setup>
import { computed } from 'vue'

import DatePicker from '@/components/ui/DatePicker.vue'
import FormField from '@/components/ui/FormField.vue'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue'])

const startKey = computed(() => `${props.field.key}_from`)
const endKey = computed(() => `${props.field.key}_to`)

const startDate = computed(() => props.modelValue[startKey.value] || '')
const endDate = computed(() => props.modelValue[endKey.value] || '')

function onStartChange(val) {
  emit('update:modelValue', { ...props.modelValue, [startKey.value]: val })
}

function onEndChange(val) {
  emit('update:modelValue', { ...props.modelValue, [endKey.value]: val })
}
</script>