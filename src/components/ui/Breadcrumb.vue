<template>
  <nav
    class="breadcrumb"
    aria-label="مسار التنقل"
  >
    <template
      v-for="(crumb, idx) in localCrumbs"
      :key="idx"
    >
      <span
        v-if="idx > 0"
        class="breadcrumb__separator"
      >›</span>
      <router-link
        v-if="crumb.to && idx < localCrumbs.length - 1"
        :to="crumb.to"
        class="breadcrumb__link"
      >
        {{ crumb.label }}
      </router-link>
      <span
        v-else
        class="breadcrumb__current"
      >{{ crumb.label }}</span>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const props = defineProps({
  items: {
    type: Array,
    default: null
  }
})

const { breadcrumbs } = useBreadcrumbs()

const localCrumbs = computed(() => {
  if (props.items && Array.isArray(props.items)) {
    return props.items
  }
  return breadcrumbs.value
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}
.breadcrumb__link {
  color: var(--color-primary);
  text-decoration: none;
}
.breadcrumb__link:hover {
  text-decoration: underline;
}
.breadcrumb__separator {
  color: var(--color-border-strong);
  font-size: var(--text-base);
  margin: 0 var(--space-1);
}
.breadcrumb__current {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  cursor: default;
}
</style>