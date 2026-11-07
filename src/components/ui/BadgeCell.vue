<template>
  <Badge
    :color="color"
    :variant="variant"
    :size="size"
    :value="value"
  >
    <slot />
  </Badge>
</template>

<script setup>
import Badge from '@/components/ui/Badge.vue'

defineProps({
  color: { type: String, default: 'primary' },
  variant: { type: String, default: 'soft' },
  size: { type: String, default: 'xs' },
  value: { type: [Number, String], default: null },
})
</script>