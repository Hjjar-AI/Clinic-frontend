<template>
  <SectionHeader
    variant="card"
    :title="title"
    :icon="icon"
    :header-variant="variant"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>
    <template
      v-if="$slots.subtitle"
      #subtitle
    >
      <slot name="subtitle" />
    </template>
    <slot />
  </SectionHeader>
</template>

<script setup>
import SectionHeader from './SectionHeader.vue'

defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: v => ['neutral','primary','warning','danger','success','purple'].includes(v)
  },
  icon: String,
  title: String,
})
</script>