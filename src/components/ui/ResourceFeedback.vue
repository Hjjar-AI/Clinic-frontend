<template>
  <AlertBar
    v-if="error || loading"
    :severity="error ? 'danger' : 'info'"
    :title="error || loadingText"
    :role="error ? 'alert' : 'status'"
    :aria-busy="!error && loading"
  >
    <BaseButton v-if="error && retryable" variant="secondary" size="sm" @click="$emit('retry')">
      إعادة المحاولة
    </BaseButton>
  </AlertBar>
</template>

<script setup>
import AlertBar from '@/components/ui/AlertBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  loadingText: { type: String, default: 'جاري تحميل البيانات…' },
  retryable: { type: Boolean, default: false },
})
defineEmits(['retry'])
</script>
