<template>
  <div
    class="toast-container"
    role="alert"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="[`toast--${t.type}`, { 'toast--persistent': t.persistent }]"
        tabindex="-1"
        @keydown.esc="removeToast(t.id)"
      >
        <Icon
          :icon="iconForType(t.type)"
          class="toast__icon"
        />
        <span class="toast__message">{{ t.message }}</span>
        <div
          v-if="t.actions && t.actions.length"
          class="toast__actions"
        >
          <button
            v-for="(action, idx) in t.actions"
            :key="idx"
            class="btn btn--primary btn--xs"
            @click="executeAction(t.id, action)"
          >
            {{ action.label }}
          </button>
        </div>
        <button
          class="toast__close"
          aria-label="إغلاق"
          @click="removeToast(t.id)"
        >
          <Icon icon="cancel" />
        </button>
        <div
          v-if="!t.persistent && t.duration > 0"
          class="toast__progress"
        >
          <div
            class="toast__progress-bar"
            :style="{ animationDuration: t.duration + 'ms' }"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

function iconForType(type) {
  return {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    danger: 'exclamation-circle'
  }[type] || 'bell'
}

function executeAction(toastId, action) {
  if (action.onClick) action.onClick()
  removeToast(toastId)
}
</script>