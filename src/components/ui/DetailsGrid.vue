<template>
  <div class="details-grid">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="details-grid__row"
    >
      <span class="details-grid__label">{{ item.label }}</span>
      <span
        class="details-grid__value"
        :class="{ 'text-mono numeric': item.numeric }"
      >
        <slot
          :name="`value-${item.key}`"
          :item="item"
        >
          {{ formatValue(item.value) }}
        </slot>
      </span>
    </div>
  </div>
</template>

<script setup>
import { useFormatters } from '@/composables/useFormatters'

const { formatNumber } = useFormatters()

defineProps({
  items: { type: Array, required: true },
})

function formatValue(val) {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'number') return formatNumber(val)
  if (typeof val === 'string' && /^\d+$/.test(val.trim())) return formatNumber(val)
  return val
}
</script>