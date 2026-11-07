<template>
  <div
    class="kpi-grid"
    :class="`kpi-grid--cols-${cols}`"
  >
    <StatCard
      v-for="item in items"
      :key="item.label"
      :icon="item.icon"
      :label="item.label"
      :value="item.value"
      :type="item.type || 'patients'"
      :subtitle="item.subtitle || ''"
      :spark-values="item.sparkValues"
    />
  </div>
</template>

<script setup>
import StatCard from '@/components/ui/StatCard.vue'

defineProps({
  items: { type: Array, required: true },
  cols: { type: Number, default: 4 } // number of columns (4, 2, 1)
})
</script>