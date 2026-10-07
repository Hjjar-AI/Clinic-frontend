<template>
  <div
    v-if="!online"
    class="system-banner system-banner--info"
  >
    <Icon
      icon="wifi-slash"
      class="system-banner__icon"
    />
    أنت غير متصل بالإنترنت – البيانات قد لا تكون محدثة.
    <BaseButton
      variant="ghost"
      size="sm"
      class="ml-2"
      @click="checkNow"
    >
      إعادة المحاولة
    </BaseButton>
  </div>
  <div
    id="live-region"
    class="visually-hidden"
    aria-live="polite"
    aria-atomic="true"
  />
</template>

<script setup>
import { onBeforeUnmount,onMounted, ref } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { useAutoCleanup } from '@/composables/useAutoCleanup'
import apiClient from '@/services/apiClient'

const { add } = useAutoCleanup()
const online = ref(navigator.onLine)

function updateStatus() {
  online.value = navigator.onLine
}

async function checkNow() {
  try {
    // FIX: go through the shared axios instance instead of raw fetch() so
    // the request inherits auth headers, CSRF handling, the loading store,
    // and the shared error interceptors. `apiClient` normalises the trailing
    // slash automatically, so `/system/health` is fine here.
    // NOTE: no `cache: 'no-store'` — that option is a browser fetch option,
    // not an axios one, and would be silently ignored. A stale health 200
    // is not harmful anyway.
    await apiClient.get('/system/health')
    online.value = true
  } catch {
    online.value = false
  }
}

window.addEventListener('online', updateStatus)
window.addEventListener('offline', updateStatus)
add(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})

let pendingMessage = ''
let announceTimer = null
function announce(message) {
  pendingMessage = message
  clearTimeout(announceTimer)
  announceTimer = setTimeout(() => {
    const el = document.getElementById('live-region')
    if (el) { el.textContent = ''; setTimeout(() => { el.textContent = pendingMessage }, 50) }
  }, 200)
}
add(() => clearTimeout(announceTimer))

onMounted(() => {
  window.__announce = announce
})
onBeforeUnmount(() => {
  delete window.__announce
})
</script>