<template>
  <section
    class="card"
    :class="{ 'card--interactive': clickable }"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="$emit('click')"
    @keydown.enter.prevent="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <header
      v-if="$slots.header || headerTitle"
      class="card__header"
    >
      <CardHeader
        v-if="headerTitle"
        :variant="headerVariant"
        :icon="headerIcon"
        :title="headerTitle"
      />
      <slot name="header" />
    </header>
    <div class="card__body">
      <SkeletonLoader
        v-if="loading"
        :type="skeletonType"
        :count="1"
      />
      <EmptyState
        v-else-if="empty"
        :type="emptyType"
        :title="emptyTitle"
      />
      <slot v-else />
    </div>
    <footer
      v-if="$slots.footer"
      class="card__footer"
    >
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup>
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

import CardHeader from './CardHeader.vue'
import EmptyState from './EmptyState.vue'

defineProps({
  clickable: Boolean,
  loading: Boolean,
  skeletonType: { type: String, default: 'card' },
  empty: Boolean,
  emptyType: { type: String, default: 'default' },
  emptyTitle: { type: String, default: '' },
  headerTitle: { type: String, default: '' },
  headerIcon: { type: String, default: '' },
  headerVariant: { type: String, default: 'neutral' },
})

defineEmits(['click'])
</script>
