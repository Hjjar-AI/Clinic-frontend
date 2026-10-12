<template>
  <RelativeDate v-if="parsedDate && relative" :date="parsedDate" />
  <time v-else-if="parsedDate" :datetime="parsedDate.toISOString()" :title="String(date)"><bdi dir="ltr">{{ formatted }}</bdi></time>
  <span v-else>{{ emptyText }}</span>
</template>

<script setup>
import { computed } from 'vue'
import RelativeDate from '@/components/ui/RelativeDate.vue'
import { useDate } from '@/composables/useDate'

const props = defineProps({
  date: { type: [String, Date], default: null },
  relative: { type: Boolean, default: true },
  showTime: { type: Boolean, default: false },
  emptyText: { type: String, default: '—' },
})
const { parseDate, formatDate } = useDate()
const parsedDate = computed(() => {
  const value = props.date instanceof Date ? props.date : parseDate(props.date)
  return value && Number.isFinite(value.getTime()) ? value : null
})
const formatted = computed(() => {
  const value = parsedDate.value
  if (!value) return ''
  return formatDate(value) + (props.showTime ? ` · ${value.toLocaleTimeString('en-GB', { hour12: false })}` : '')
})
</script>