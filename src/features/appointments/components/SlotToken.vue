<template>
  <div
    class="slot-token"
    :class="`slot-token--${state}`"
  >
    <span class="slot-token__label"><slot /></span>
  </div>
</template>

<script setup>
defineProps({
  state: {
    type: String,
    default: 'available',
    validator: v => ['available', 'occupied', 'active'].includes(v)
  }
})
</script>