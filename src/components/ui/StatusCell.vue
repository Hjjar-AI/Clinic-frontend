<template>
  <Badge
    v-if="status"
    :status="status"
    :status-type="statusType"
    :size="size"
    variant="soft"
  />
  <span v-else>—</span>
</template>

<script setup>
import Badge from '@/components/ui/Badge.vue'

defineProps({
  status: { type: String, default: '' },
  statusType: { type: String, default: 'appointment' },
  size: { type: String, default: 'xs' },
})
</script>