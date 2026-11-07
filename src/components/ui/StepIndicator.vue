<template>
  <div class="step-indicator">
    <div
      v-for="(step, idx) in steps"
      :key="idx"
      class="step"
      :class="{ 'step--active': idx === current, 'step--done': idx < current }"
    >
      <div class="step__circle">
        <Icon
          v-if="idx < current"
          icon="check"
        />
        <span v-else>{{ idx + 1 }}</span>
      </div>
      <span class="step__label">{{ step }}</span>
      <div
        v-if="idx < steps.length - 1"
        class="step__line"
      />
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'

defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, default: 0 }
})
</script>