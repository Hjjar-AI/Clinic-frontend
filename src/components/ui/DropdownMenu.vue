<template>
  <div
    ref="triggerRef"
    class="dropdown-menu-wrapper"
  >
    <div
      class="dropdown-menu__trigger"
      @click="toggle"
    >
      <slot name="trigger">
        <BaseButton
          v-if="primaryAction"
          :variant="primaryVariant"
          :size="sizeClass"
          :disabled="primaryAction.disabled"
          @click.stop="executeAction(primaryAction)"
        >
          <Icon
            v-if="primaryAction.icon"
            :icon="primaryAction.icon"
          /> {{ primaryAction.label }}
        </BaseButton>
        <BaseButton
          v-if="secondaryActions.length"
          variant="secondary"
          :size="sizeClass"
          aria-label="المزيد من الإجراءات"
        >
          <Icon icon="ellipsis-h" />
        </BaseButton>
      </slot>
    </div>
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="open"
          ref="panelRef"
          class="context-menu"
          :style="positionStyle"
          @focusout="onFocusOut"
        >
          <button
            v-for="action in secondaryActions"
            :key="action.label"
            class="context-menu__item"
            @click="executeAction(action)"
          >
            <Icon
              v-if="action.icon"
              :icon="action.icon"
            /> {{ action.label }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import { useDropdown } from '@/composables/useDropdown'

import Icon from './Icon.vue'

const props = defineProps({
  primaryAction: { type: Object, default: null },
  secondaryActions: { type: Array, default: () => [] },
  primaryVariant: { type: String, default: 'primary' },
  size: { type: String, default: 'sm' },
})

const emit = defineEmits(['action'])

const { triggerRef, panelRef, open, positionStyle, toggle, close, observeTrigger } = useDropdown()

const sizeClass = props.size === 'xs' ? 'btn--xs' : props.size === 'lg' ? 'btn--lg' : 'btn--sm'

function executeAction(action) { close(); if (action.onClick) action.onClick(); emit('action', action) }
function onFocusOut(e) {
  const trigger = triggerRef.value?.$el || triggerRef.value
  if (!trigger?.contains(e.relatedTarget) && !panelRef.value?.contains(e.relatedTarget)) close()
}

onMounted(() => { observeTrigger() })
</script>