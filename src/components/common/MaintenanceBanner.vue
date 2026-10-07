<template>
  <div
    v-if="maintenance"
    class="system-banner system-banner--warning"
  >
    <Icon
      icon="tools"
      class="system-banner__icon"
    />
    <span>النظام في وضع الصيانة حالياً – قد تتأثر بعض الخدمات.</span>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { useMaintenanceMode } from '@/composables/useMaintenanceMode'

const { maintenance, check } = useMaintenanceMode()

onMounted(() => {
  check()
})
</script>