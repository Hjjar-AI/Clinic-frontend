<template>
  <label
    class="checkbox"
    :for="checkboxId"
  >
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      class="checkbox__input"
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    <span :class="{ 'text-danger font-bold': variant === 'danger', 'text-xs': true }">
      {{ label }}
    </span>
  </label>
</template>

<script setup>
import { useId } from 'vue'

const checkboxId = `confirm-checkbox-${useId()}`

defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  variant: { type: String, default: 'danger' },   // danger | warning | info
})

defineEmits(['update:modelValue'])
</script>
