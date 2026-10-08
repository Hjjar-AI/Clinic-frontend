<template>
  <small
    v-if="error"
    class="field-error field-error-content"
  >
    <Icon icon="exclamation-circle" />
    {{ error }}
  </small>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
defineProps({ error: { type: String, default: '' } })
</script>