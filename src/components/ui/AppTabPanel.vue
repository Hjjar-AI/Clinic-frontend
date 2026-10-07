<template>
  <div
    v-show="activeTab === id"
    :id="`tabpanel-${id}`"
    role="tabpanel"
    :aria-labelledby="`tab-${id}`"
  >
    <slot />
  </div>
</template>

<script setup>
import { inject, onMounted } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String, default: '' },
})

const { registerTab, activeTab } = inject('appTabs')

onMounted(() => {
  registerTab({ id: props.id, label: props.label, icon: props.icon })
})
</script>
