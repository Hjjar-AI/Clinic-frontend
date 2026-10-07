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
          :min="0"
          :max="max"
          class="form-control score-input__input numeric"
          :disabled="disabled"
          :placeholder="'0'"
          :aria-label="label || 'الدرجة'"
          :aria-invalid="Boolean(error)"
        >
        <output
          class="score-input__current"
          :for="inputId"
          aria-label="القيمة الحالية"
        >{{ formatArabic(modelValue ?? 0) }}</output>
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
        >{{ formatArabic(modelValue ?? 0) }}</output>
      </div>
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
const modelValue = defineModel({ type: Number, default: 0 })

const formatArabic = (value) => {
  return toArabicNumerals(value)
}
</script>

<style scoped>
.score-input__current {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  min-width: 3ch;
  text-align: center;
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
  padding: var(--space-0) var(--space-2);
}
.score-input__max {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.scale-slider__value {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-3);
  min-width: 3rem;
  text-align: center;
  flex-shrink: 0;
}
</style>
