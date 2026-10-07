<template>
  <BaseCard
    class="collapsible-section"
    :class="{ 'is-open': isOpen }"
  >
    <template #header>
      <button
        class="collapsible-section__header"
        :aria-expanded="isOpen"
        type="button"
        @click="toggle"
      >
        <div class="collapsible-section__header-content">
          <Icon
            v-if="icon"
            :icon="icon"
          />
          <span class="collapsible-section__title">{{ title }}</span>
        </div>
        <div
          class="collapsible-section__toggle"
          :class="{ 'is-open': isOpen }"
        >
          ▼
        </div>
      </button>
    </template>

    <Transition name="collapse">
      <div
        v-if="isOpen"
        class="collapsible-section__body"
      >
        <slot />
      </div>
    </Transition>
  </BaseCard>
</template>

<script setup>
import { onMounted,ref } from 'vue'

import BaseCard from './BaseCard.vue'
import Icon from './Icon.vue'

const props = defineProps({
  title: { type: String, required: true },
  open: { type: Boolean, default: false },
  persistKey: { type: String, default: '' },
  icon: { type: String, default: '' },
})

const storageKey = `collapsible_${props.persistKey || props.title}`
const isOpen = ref(false)

onMounted(() => {
  if (props.persistKey) {
    const stored = sessionStorage.getItem(storageKey)
    if (stored !== null) { isOpen.value = stored === 'true'; return }
  }
  isOpen.value = props.open
})

function toggle() {
  isOpen.value = !isOpen.value
  if (props.persistKey) sessionStorage.setItem(storageKey, String(isOpen.value))
}
</script>