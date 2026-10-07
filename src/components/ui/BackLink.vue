<template>
  <BaseButton
    v-if="canGoBack"
    variant="ghost"
    size="sm"
    icon="arrow-right"
    class="back-link"
    @click="goBack"
  >
    {{ label }}
  </BaseButton>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from './BaseButton.vue'

defineProps({
  label: { type: String, default: 'العودة' }
})

const router = useRouter()
const canGoBack = computed(() => router.options.history.state.back !== null)

function goBack() {
  router.back()
}
</script>
