<template>
  <FormField
    :label="label"
    :required="required"
    :error="error"
    :help="help"
    :field-id="inputId"
  >
    <div class="time-picker">
      <select
        :id="inputId"
        :value="modelValue"
        class="form-control form-control--select"
        :disabled="disabled"
        :required="required"
        :aria-label="label || placeholder"
        :aria-invalid="Boolean(error)"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option
          value=""
          disabled
        >
          {{ placeholder }}
        </option>
        <option
          v-for="time in timeOptions"
          :key="time"
          :value="time"
        >
          {{ formatArabic(time) }}
        </option>
      </select>
    </div>
  </FormField>
</template>

<script setup>
import { computed, useId } from 'vue'

import { toArabicNumerals } from '@/utils/formatters'

import FormField from './FormField.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: 'اختر الوقت' },
  step: { type: Number, default: 30 },
  min: { type: String, default: '08:00' },
  max: { type: String, default: '23:30' },
})

defineEmits(['update:modelValue'])

const inputId = `time-${useId()}`

const timeOptions = computed(() => {
  const options = []
  const [startH, startM] = props.min.split(':').map(Number)
  const [endH, endM] = props.max.split(':').map(Number)
  if (![startH,startM,endH,endM,props.step].every(Number.isFinite) || !Number.isInteger(props.step) || props.step <= 0 || startH < 0 || endH > 23 || startM < 0 || startM > 59 || endM < 0 || endM > 59 || startH * 60 + startM > endH * 60 + endM) return []
  for (let minute = startH * 60 + startM; minute <= endH * 60 + endM; minute += props.step) options.push(`${String(Math.floor(minute / 60)).padStart(2,'0')}:${String(minute % 60).padStart(2,'0')}`)
  return options
})

const formatArabic = (time) => {
  return toArabicNumerals(time)
}
</script>
