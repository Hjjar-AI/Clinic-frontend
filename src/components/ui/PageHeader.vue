<template>
  <SectionHeader
    variant="page"
    :title="title"
    :subtitle="subtitle"
  >
    <template #actions>
      <slot name="actions">
        <slot />
      </slot>
    </template>
  </SectionHeader>
</template>

<script setup>
import SectionHeader from './SectionHeader.vue'

defineProps({
  title: String,
  subtitle: String
})
</script>