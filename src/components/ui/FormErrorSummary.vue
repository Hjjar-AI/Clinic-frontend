<template>
  <div
    v-if="errorCount"
    class="alert alert--danger"
  >
    <Icon
      icon="exclamation-circle"
      class="mr-2"
    />
    <div>
      <strong>يرجى تصحيح الأخطاء التالية:</strong>
      <ul class="mt-1">
        <li
          v-for="(msg, field) in errors"
          :key="field"
        >
          {{ msg }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import Icon from '@/components/ui/Icon.vue'
const props = defineProps({ errors: { type: Object, default: () => ({}) } })
const errorCount = computed(() => Object.keys(props.errors).length)
</script>