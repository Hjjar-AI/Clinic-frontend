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
    validator: v => ['xs', 'sm', 'md', 'lg'].includes(v)
  }
})
</script>

<style scoped>
/* Sizes are inherited from tokens.css via .spinner--xs etc. */
</style>