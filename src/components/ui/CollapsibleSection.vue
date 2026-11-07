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
          <span
            class="collapsible-section__title"
            role="heading"
            aria-level="2"
          >{{ title }}</span>
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
import { ref, watch } from 'vue'

import BaseCard from './BaseCard.vue'
import Icon from './Icon.vue'

const emit = defineEmits(['update:open'])
const props = defineProps({
  title: { type: String, required: true },
  open: { type: Boolean, default: false },
  persistKey: { type: String, default: '' },
  icon: { type: String, default: '' },
})

const isOpen = ref(props.open)
const storageKey = () => `collapsible_${props.persistKey}`
watch(
  () => props.open,
  (value) => {
    isOpen.value = value
  },
)
watch(
  () => props.persistKey,
  (key) => {
    if (!key) return
    try {
      const stored = sessionStorage.getItem(storageKey())
      if (stored !== null) isOpen.value = stored === 'true'
    } catch {
      /* Disclosure remains usable. */
    }
  },
  { immediate: true },
)
function toggle() {
  isOpen.value = !isOpen.value
  emit('update:open', isOpen.value)
  if (props.persistKey) {
    try {
      sessionStorage.setItem(storageKey(), String(isOpen.value))
    } catch {
      /* Optional preference. */
    }
  }
}
</script>
