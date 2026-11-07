<template>
  <div
    class="lab-result"
    :class="`lab-result--${flag}`"
  >
    <div class="lab-result__name">
      {{ name }}
    </div>
    <div class="lab-result__value numeric">
      {{ value }}
    </div>
    <div class="lab-result__ref">
      {{ refRange }}
    </div>
    <div class="lab-result__flag">
      <span
        v-if="flag === 'danger'"
        class="tag tag--danger-soft"
      >
        <Icon icon="exclamation-triangle" /> مرتفع
      </span>
      <span
        v-else-if="flag === 'warning'"
        class="tag tag--warning-soft"
      >
        <Icon icon="exclamation-circle" /> منخفض
      </span>
      <span
        v-else-if="flag === 'normal'"
        class="tag tag--success-soft"
      >
        <Icon icon="check-circle" /> طبيعي
      </span>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
defineProps({
  name: { type: String, required: true },
  value: { type: [Number, String], required: true },
  refRange: { type: String, default: '' },
  flag: { type: String, default: 'normal', validator: v => ['normal', 'warning', 'danger'].includes(v) }
})
</script>