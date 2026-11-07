<template>
  <div class="calendar-skeleton">
    <div class="calendar-skeleton__header">
      <SkeletonLoader
        type="card"
        :count="1"
      />
    </div>
    <div class="calendar-skeleton__grid">
      <div
        v-for="i in rows"
        :key="i"
        class="calendar-skeleton__row"
      >
        <SkeletonLoader
          type="card"
          :count="cols"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

defineProps({
  rows: { type: Number, default: 12 },
  cols: { type: Number, default: 3 }
})
</script>