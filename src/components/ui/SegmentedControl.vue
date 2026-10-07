<template>
  <div class="segmented-control">
    <label
      v-for="option in options"
      :key="option.value"
      class="segmented-control__item"
      :class="{ 'segmented-control__item--active': option.value === modelValue }"
      :for="optionId(option.value)"
    >
      <input
        :id="optionId(option.value)"
        :name="groupName"
        type="radio"
        :value="option.value"
        :checked="option.value === modelValue"
        class="visually-hidden"
        @change="$emit('update:modelValue', option.value)"
      >
      {{ option.label }}
    </label>
  </div>
</template>

<script setup>
import { useId } from 'vue'

const groupName = `segmented-${useId()}`

function optionId(value) {
  return `${groupName}-${String(value).replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>
