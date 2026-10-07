<!-- src/components/ui/Avatar.vue -->
<template>
  <div
    class="avatar"
    :class="[`avatar--${size}`]"
    :style="avatarStyle"
    :aria-label="name || 'صورة رمزية'"
  >
    <Icon
      v-if="icon"
      :icon="icon"
      aria-hidden="true"
    />
    <span v-else-if="name">{{ initials }}</span>
    <Icon
      v-else
      icon="user"
      aria-hidden="true"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: String, default: 'md', validator: v => ['xs','sm','md','lg','xl'].includes(v) },
  color: { type: String, default: 'primary' },
  name: String,
  icon: String
})

const initials = computed(() => {
  if (!props.name) return ''
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || ''
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

const avatarStyle = computed(() => {
  if (!props.name) return {}
  const hash = props.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hue = hash % 360
  return {
    backgroundColor: `hsl(${hue}, 30%, 88%)`,
    color: `hsl(${hue}, 50%, 35%)`
  }
})
</script>