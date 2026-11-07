<template>
  <div
    class="alert"
    :class="`alert--${severity}`"
  >
    <Icon
      :icon="icon"
      class="mr-2"
    />
    <div>
      <strong v-if="title">{{ title }}</strong>
      <ul
        v-if="errors.length"
        class="mt-1"
      >
        <li
          v-for="(err, idx) in errors"
          :key="idx"
        >
          {{ err }}
        </li>
      </ul>
      <p v-else>
        {{ fallbackMessage }}
      </p>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  severity: { type: String, default: 'danger', validator: v => ['danger','warning','info','success'].includes(v) },
  title: { type: String, default: '' },
  errors: { type: Array, default: () => [] },
  fallbackMessage: { type: String, default: 'يرجى المحاولة مرة أخرى.' }
})

const icon = computed(() => ({
  danger: 'exclamation-circle',
  warning: 'exclamation-triangle',
  info: 'info-circle',
  success: 'check-circle'
}[props.severity]))
</script>