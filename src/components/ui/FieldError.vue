<template>
  <small
    v-if="error"
    class="field-error"
    style="display:flex; align-items:center; gap:var(--space-1);"
  >
    <Icon icon="exclamation-circle" />
    {{ error }}
  </small>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
defineProps({ error: { type: String, default: '' } })
</script>