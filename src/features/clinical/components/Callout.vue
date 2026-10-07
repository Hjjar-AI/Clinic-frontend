<template>
  <div
    class="callout"
    :class="`callout--${variant}`"
  >
    <Icon
      :icon="icon"
      class="callout__icon"
    />
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  variant: { type: String, default: 'primary', validator: v => ['primary','info','warning','danger','success'].includes(v) }
})

const icon = computed(() => ({
  primary: 'info-circle', info: 'info-circle', warning: 'exclamation-triangle',
  danger: 'exclamation-circle', success: 'check-circle'
}[props.variant] || 'info-circle'))
</script>