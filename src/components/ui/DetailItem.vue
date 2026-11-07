<template>
  <div class="detail-item">
    <span class="detail-item__label">{{ label }}</span>
    <span
      class="detail-item__value"
      :class="{ 'text-mono numeric': numeric }"
      :dir="numeric ? 'ltr' : 'auto'"
    >
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '' },
  numeric: { type: Boolean, default: false }
})
</script>