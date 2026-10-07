<template>
  <Badge
    :status="level"
    status-type="risk"
    variant="soft"
    :size="size"
  />
</template>

<script setup>
import Badge from '@/components/ui/Badge.vue'

defineProps({
  level: { type: String, default: '' },
  type: { type: String, default: 'suicide' },
  size: { type: String, default: 'xs' }
})
</script>