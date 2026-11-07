<template>
  <span
    :title="exactDate"
    class="relative-date"
  >
    <Icon
      v-if="icon"
      :icon="icon"
      class="relative-date__icon"
    />
    <span
      v-if="label"
      class="relative-date__label"
    >{{ label }}</span>
    <span class="relative-date__value">{{ friendly }}</span>
    <slot name="actions" />
  </span>
</template>

<script setup>
import { computed, onBeforeUnmount,onMounted, ref } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { useDate } from '@/composables/useDate'

const props = defineProps({
  date: { type: [String, Date], required: true },
  icon: { type: String, default: '' },
  label: { type: String, default: '' }
})

const { timeAgo, formatDate } = useDate()

const dateObj = computed(() => {
  if (!props.date) return null
  return props.date instanceof Date ? props.date : new Date(props.date)
})

const now = ref(Date.now())
let timer = null

function scheduleNext() {
  if (!dateObj.value) return
  const diffMs = Date.now() - dateObj.value.getTime()
  const delay = diffMs < 3600_000 ? 60_000 : diffMs < 86400_000 ? 1800_000 : 3600_000
  clearTimeout(timer)
  timer = setTimeout(() => {
    now.value = Date.now()
    scheduleNext()
  }, delay)
}

onMounted(() => {
  scheduleNext()
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

const friendly = computed(() => {
  return now.value ? timeAgo(dateObj.value) : ''
})

const exactDate = computed(() => formatDate(dateObj.value))
</script>
