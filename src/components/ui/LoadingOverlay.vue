<!-- frontend/src/components/ui/LoadingOverlay.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="loading-overlay active"
    >
      <Spinner
        size="lg"
        variant="primary"
      />
    </div>
  </Teleport>
</template>

<script setup>
import Spinner from '@/components/common/Spinner.vue'

defineProps({
  modelValue: Boolean
})
</script>