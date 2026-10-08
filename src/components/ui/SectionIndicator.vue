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

<style scoped src="../../styles/components/ui/section-indicator.css"></style>
