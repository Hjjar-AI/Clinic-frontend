<template>
  <div class="app-tabs">
    <div
      class="app-tabs__header"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="app-tabs__tab"
        :class="{ 'app-tabs__tab--active': activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`tabpanel-${tab.id}`"
        @click="selectTab(tab.id)"
      >
        <Icon
          v-if="tab.icon"
          :icon="tab.icon"
          class="app-tabs__tab-icon"
        />
        {{ tab.label }}
      </button>
    </div>
    <div class="app-tabs__panels">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { provide, ref, watch } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'tab-change'])

const tabs = ref([])
const activeTab = ref(props.modelValue || '')

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== activeTab.value) {
    activeTab.value = newVal
  }
})

function selectTab(id) {
  activeTab.value = id
  emit('update:modelValue', id)
  emit('tab-change', id)
}

provide('appTabs', {
  registerTab(tab) {
    const exists = tabs.value.find(t => t.id === tab.id)
    if (!exists) {
      tabs.value.push(tab)
      if (!activeTab.value) {
        activeTab.value = tab.id
        emit('update:modelValue', tab.id)
        emit('tab-change', tab.id)
      }
    }
  },
  activeTab,
})
</script>
