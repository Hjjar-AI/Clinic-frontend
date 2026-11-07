<template>
  <div
    v-if="!external"
    v-show="activeTab === id"
    :id="`${prefix}-panel-${id}`"
    role="tabpanel"
    :aria-labelledby="`${prefix}-tab-${id}`"
  >
    <slot />
  </div>
</template>

<script setup>
import { inject, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  external: Boolean,
  icon: { type: String, default: '' },
})

const { registerTab, unregisterTab, activeTab, prefix } = inject('appTabs')

onMounted(() => {
  registerTab({ id: props.id, label: props.label, icon: props.icon })
})
onBeforeUnmount(() => unregisterTab(props.id))
</script>
