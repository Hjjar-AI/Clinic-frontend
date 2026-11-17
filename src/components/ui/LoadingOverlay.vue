<!-- frontend/src/components/ui/LoadingOverlay.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="loading-overlay active"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner
        size="lg"
        variant="primary"
      />
      <p v-if="message" class="loading-overlay__message">{{ message }}</p>
    </div>
  </Teleport>
</template>

<script setup>
import Spinner from '@/components/common/Spinner.vue'

defineProps({
  modelValue: Boolean,
  message: { type: String, default: '' }
})
</script>