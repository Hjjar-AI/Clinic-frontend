<template>
  <div
    class="alert-bar"
    :class="`alert-bar--${severity}`"
  >
    <div class="alert-bar__icon">
      <Icon :icon="icon" />
    </div>
    <div class="alert-bar__content">
      <slot name="title">
        <h5
          v-if="title"
          class="alert-bar__title"
        >
          {{ title }}
        </h5>
      </slot>
      <p
        v-if="description"
        class="alert-bar__desc"
      >
        {{ description }}
      </p>
      <slot />
    </div>
    <div
      v-if="$slots.badge"
      class="alert-bar__badge"
    >
      <slot name="badge" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  severity: { type: String, default: 'warning', validator: v => ['warning','danger','info','success'].includes(v) },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' }
})

const icon = computed(() => {
  if (props.icon) return props.icon
  return { warning: 'exclamation-triangle', danger: 'exclamation-circle', info: 'info-circle', success: 'check-circle' }[props.severity] || 'info-circle'
})
</script>