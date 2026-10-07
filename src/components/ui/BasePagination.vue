<template>
  <div
    v-if="totalPages > 1"
    class="pagination-wrapper"
  >
    <BaseButton
      variant="secondary"
      class="pagination-btn"
      :disabled="page === 1"
      @click="$emit('prev')"
    >
      <Icon icon="chevron-right" />
    </BaseButton>
    <BaseButton
      v-for="p in displayedPages"
      :key="p"
      :variant="p === page ? 'primary' : 'secondary'"
      class="pagination-btn"
      @click="$emit('go', p)"
    >
      {{ formatNumber(p) }}
    </BaseButton>
    <BaseButton
      variant="secondary"
      class="pagination-btn"
      :disabled="page === totalPages"
      @click="$emit('next')"
    >
      <Icon icon="chevron-left" />
    </BaseButton>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { useFormatters } from '@/composables/useFormatters'

import Icon from './Icon.vue'

const props = defineProps({ page: { type: Number, required: true }, totalPages: { type: Number, required: true } })
defineEmits(['prev', 'next', 'go'])

const { formatNumber } = useFormatters()

const displayedPages = computed(() => {
  const pages = []
  const start = Math.max(1, props.page - 2)
  const end = Math.min(props.totalPages, props.page + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>