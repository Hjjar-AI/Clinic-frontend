<template>
  <div class="severity-pills">
    <span
      v-if="label"
      :id="labelId"
      class="severity-pills__label"
    >{{ label }}</span>
    <div
      class="severity-pills__row"
      role="group"
      :aria-labelledby="label ? labelId : undefined"
    >
      <BaseButton
        v-for="option in options"
        :key="option.value"
        :variant="modelValue === option.value ? 'primary' : 'secondary'"
        size="xs"
        :disabled="disabled"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useId } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'

const labelId = `severity-${useId()}`

defineProps({
  modelValue: { type: Number, default: null },
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>
