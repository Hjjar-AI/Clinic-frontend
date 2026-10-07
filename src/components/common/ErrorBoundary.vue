<!-- frontend/src/components/common/ErrorBoundary.vue -->
<template>
  <div
    v-if="error"
    class="error-boundary-card"
  >
    <div class="error-boundary-card__content">
      <Icon
        icon="exclamation-triangle"
        class="text-danger text-3xl mb-3"
      />
      <h3 class="heading-4 mb-2">
        حدث خطأ غير متوقع
      </h3>
      <p class="text-muted text-sm mb-3">
        {{ friendlyMessage }}
      </p>
      <div class="flex flex--gap-2 flex--justify-center">
        <BaseButton
          variant="primary"
          @click="retry"
        >
          إعادة المحاولة
        </BaseButton>
        <BaseButton
          variant="secondary"
          @click="reloadPage"
        >
          تحديث الصفحة
        </BaseButton>
        <BaseButton
          variant="secondary"
          @click="goHome"
        >
          العودة للرئيسية
        </BaseButton>
      </div>
      <details
        v-if="showDetails"
        class="mt-3 text-xs text-muted"
      >
        <summary>تفاصيل الخطأ (للمطورين)</summary>
        <pre class="mt-2 p-2 rounded surface-soft">{{ error.stack || error.message }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { onErrorCaptured, ref, watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import Icon from '@/components/ui/Icon.vue'

const router = useRouter()
const route = useRoute()
const error = ref(null)
const showDetails = ref(import.meta.env.DEV)

const friendlyMessage = ref('يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.')

onErrorCaptured((err, instance, info) => {
  console.error('[ErrorBoundary]', err, info)
  error.value = err
  friendlyMessage.value = err.message || 'حدث خطأ غير متوقع.'
  return false
})

// Clear error when navigating away
watch(() => route.fullPath, () => {
  if (error.value) {
    error.value = null
  }
})

function retry() {
  error.value = null
}

function reloadPage() {
  window.location.reload()
}

function goHome() {
  error.value = null
  router.push({ name: 'Dashboard' })
}
</script>