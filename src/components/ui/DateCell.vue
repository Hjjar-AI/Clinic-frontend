<template>
  <RelativeDate
    v-if="date"
    :date="date"
  />
  <span v-else>—</span>
</template>

<script setup>
import RelativeDate from '@/components/ui/RelativeDate.vue'

defineProps({
  date: { type: [String, Date], default: null },
})
</script>