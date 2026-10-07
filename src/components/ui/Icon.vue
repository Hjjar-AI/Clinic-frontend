<template>
  <i
    :class="computedClass"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue'

import { ICON_MAP } from '@/utils/iconMap'

const props = defineProps({
  icon: { type: String, required: true },
  spin: { type: Boolean, default: false },
  size: { type: String, default: '' },
  color: { type: String, default: '' }
})

const resolvedIcon = computed(() => ICON_MAP[props.icon] || props.icon)

const computedClass = computed(() => {
  const cls = ['fas', `fa-${resolvedIcon.value}`]
  if (props.spin) cls.push('fa-spin')
  if (props.size) cls.push(`icon--${props.size}`)
  if (props.color) cls.push(`text-${props.color}`)
  return cls.join(' ')
})
</script>