<template>
  <span
    class="spinner"
    :class="`spinner--${size}`"
  />
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg'].includes(v),
  },
})
</script>
