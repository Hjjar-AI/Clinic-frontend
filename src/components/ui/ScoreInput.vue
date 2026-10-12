<template>
  <FormField
    :label="label"
    :error="error"
    :help="hint"
    :field-id="inputId"
  >
    <div class="score-input">
      <!-- Number input variant -->
      <div
        v-if="type === 'number'"
        class="score-input__field"
      >
        <input
          :id="inputId"
          v-model.number="modelValue"
          type="number"
          :min="min"
          :max="max"
          class="form-control score-input__input numeric"
          :disabled="disabled"
          :placeholder="'غير مقيم'"
          :aria-label="label || 'الدرجة'"
          :aria-invalid="Boolean(error)"
        >
        <output
          class="score-input__current"
          :for="inputId"
          aria-label="القيمة الحالية"
        >{{ modelValue == null || modelValue === '' ? 'غير مقيم' : formatArabic(modelValue) }}</output>
        <span class="score-input__max">/ {{ formatArabic(max) }}</span>
      </div>
      <!-- Slider variant -->
      <div
        v-else
        class="scale-slider__track"
      >
        <input
          :id="inputId"
          v-model.number="modelValue"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          class="scale-slider__input"
          :disabled="disabled"
          :aria-label="label || 'الدرجة'"
          :aria-invalid="Boolean(error)"
        >
        <output
          class="scale-slider__value"
          :for="inputId"
          aria-label="القيمة الحالية"
        >{{ modelValue == null || modelValue === '' ? 'غير مقيم' : formatArabic(modelValue) }}</output>
      </div>
      <button v-if="modelValue != null" type="button" class="btn btn--ghost btn--sm" :disabled="disabled" @click="modelValue = null">غير مقيم</button>
    </div>
  </FormField>
</template>

<script setup>
import { useId } from 'vue'

import { toArabicNumerals } from '@/utils/formatters'

import FormField from './FormField.vue'

defineProps({
  max: { type: Number, required: true },
  min: { type: Number, default: 0 },
  step: { type: Number, default: 1 },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  type: { type: String, default: 'number', validator: v => ['number', 'slider'].includes(v) },
  error: { type: String, default: '' },
})

const inputId = `score-${useId()}`
const modelValue = defineModel({ type: Number, default: null, set: value => value === '' ? null : value })

const formatArabic = (value) => {
  return toArabicNumerals(value)
}
</script>

<style scoped src="../../styles/components/ui/score-input.css"></style>
