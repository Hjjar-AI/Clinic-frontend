<template>
  <div
    class="checklist-item"
    :class="{ 'checklist-item--checked': modelValue, 'checklist-item--missed': missed }"
  >
    <label
      class="checklist-item__label"
      :for="checkboxId"
    >
      <input
        :id="checkboxId"
        type="checkbox"
        :checked="modelValue"
        class="checklist-item__checkbox"
        :disabled="disabled"
        @change="$emit('update:modelValue', $event.target.checked)"
      >
      <div class="checklist-item__content">
        <span class="checklist-item__title">{{ title }}</span>
        <p
          v-if="description"
          class="checklist-item__desc"
        >{{ description }}</p>
        <slot name="description" />
      </div>
    </label>
  </div>
</template>

<script setup>
import { useId } from 'vue'

const checkboxId = `checklist-${useId()}`

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  missed: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>
