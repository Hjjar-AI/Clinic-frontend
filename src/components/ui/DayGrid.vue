<template>
  <div class="day-grid">
    <div
      v-for="(day, idx) in days"
      :key="idx"
      class="day-grid__item"
      :class="{
        'day-grid__item--active': day.active,
        'day-grid__item--inactive': !day.active && !day.past,
        'day-grid__item--past': day.past
      }"
      :title="day.label"
    >
      <Icon
        v-if="day.active"
        icon="check-circle"
        class="day-grid__icon"
      />
      <Icon
        v-else-if="day.past"
        icon="times-circle"
        class="day-grid__icon"
      />
      <Icon
        v-else
        icon="clock"
        class="day-grid__icon"
      />
      <span class="day-grid__label">{{ day.label }}</span>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'

defineProps({
  days: { type: Array, required: true }   // [{ label, active, past }]
})
</script>