<template>
  <span
    class="section-indicator"
    :class="`section-indicator--${state}`"
    :title="tooltip"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 'complete', 'warning', 'incomplete' */
  state: { type: String, default: 'incomplete', validator: v => ['complete','warning','incomplete'].includes(v) }
})

const tooltip = computed(() => ({
  complete: 'مكتمل',
  warning: 'بحاجة لمراجعة',
  incomplete: 'غير مكتمل'
}[props.state]))
</script>

<style scoped>
.section-indicator {
  display: inline-block;
  width: 12px; height: 12px;
  border-radius: 50%;
  margin-inline-end: var(--space-2);
  vertical-align: middle;
}

.section-indicator--complete { background: var(--color-success); }
.section-indicator--warning  { background: var(--color-warning); }
.section-indicator--incomplete { background: var(--color-border-strong); }
</style>