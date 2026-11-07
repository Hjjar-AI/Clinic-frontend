<template>
  <div class="danger-zone">
    <h4 class="danger-zone__title">
      {{ title }}
    </h4>
    <p class="danger-zone__desc">
      {{ description }}
    </p>
    <div class="danger-zone__actions">
      <slot name="actions">
        <button
          v-if="actionText"
          class="btn btn--danger"
          @click="$emit('action')"
        >
          <Icon icon="exclamation-triangle" /> {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
defineProps({ title: String, description: String, actionText: String })
defineEmits(['action'])
</script>