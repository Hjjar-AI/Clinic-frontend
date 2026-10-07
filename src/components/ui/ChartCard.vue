<!-- frontend/src/components/ui/ChartCard.vue -->
<template>
  <BaseCard class="chart-card">
    <template
      v-if="title"
      #header
    >
      <Icon
        v-if="icon"
        :icon="icon"
      />
      <span>{{ title }}</span>
    </template>

    <div class="chart-card__body">
      <Transition name="chart-entrance">
        <div
          v-if="hasData"
          class="chart-container"
        >
          <slot />
        </div>
        <EmptyState
          v-else
          type="charts"
          :title="emptyTitle || 'لا توجد بيانات كافية'"
          :description="emptyDescription || ''"
          small
        />
      </Transition>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  hasData: { type: Boolean, default: false },
  emptyTitle: { type: String, default: '' },
  emptyDescription: { type: String, default: '' }
})
</script>