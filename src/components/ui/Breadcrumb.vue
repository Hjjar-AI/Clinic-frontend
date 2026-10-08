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

<style scoped src="../../styles/components/ui/breadcrumb.css"></style>
