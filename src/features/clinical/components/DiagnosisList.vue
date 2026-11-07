<template>
  <div
    v-if="diagnoses.length"
    class="diagnosis-list"
  >
    <span
      v-for="(d, idx) in diagnoses"
      :key="idx"
      class="tag tag--code"
    >
      <template v-if="d.code">{{ d.code }}</template>
      <template v-if="d.name && variant !== 'code-only'"> {{ d.arabic_name || d.name }}</template>
    </span>
  </div>
</template>

<script setup>
defineProps({
  diagnoses: { type: Array, required: true },
  variant: { type: String, default: 'full' },  // 'full' | 'code-only'
})
</script>