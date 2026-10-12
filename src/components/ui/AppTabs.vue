<template>
  <div class="app-tabs">
    <div
      class="app-tabs__header"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :id="`${prefix}-tab-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        @keydown="navigateTabs($event, tab.id)"
        class="app-tabs__tab"
        :class="{ 'app-tabs__tab--active': activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`${prefix}-panel-${tab.id}`"
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
import { provide, ref, watch, useId, nextTick } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  idPrefix: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'tab-change'])

const prefix = props.idPrefix || `tabs-${useId()}`
const tabs = ref([])
const activeTab = ref(props.modelValue || '')

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== activeTab.value) {
    activeTab.value = newVal
    reconcile()
  }
})

function reconcile() {
  nextTick(() => { if (tabs.value.length && !tabs.value.some(tab => tab.id === activeTab.value)) selectTab(tabs.value[0].id) })
}

function selectTab(id) {
  activeTab.value = id
  emit('update:modelValue', id)
  emit('tab-change', id)
}

function navigateTabs(event, id) {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return
  event.preventDefault()
  const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
  const index = tabs.value.findIndex(tab => tab.id === id)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.value.length - 1 : (index + (event.key === 'ArrowRight' ? (rtl ? -1 : 1) : (rtl ? 1 : -1)) + tabs.value.length) % tabs.value.length
  const target = tabs.value[next]?.id
  if (target) { selectTab(target); nextTick(() => document.getElementById(`${prefix}-tab-${target}`)?.focus()) }
}
provide('appTabs', {
  prefix,
  unregisterTab(id) {
    tabs.value = tabs.value.filter(tab => tab.id !== id)
    if (activeTab.value === id) selectTab(tabs.value[0]?.id || '')
  },
  registerTab(tab) {
    const exists = tabs.value.find(t => t.id === tab.id)
    if (!exists) {
      tabs.value.push(tab)
      reconcile()
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
