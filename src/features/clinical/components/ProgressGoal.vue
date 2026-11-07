<template>
  <div class="progress-goal">
    <div class="progress-goal__header">
      <span class="progress-goal__title">{{ title }}</span>
      <span class="progress-goal__percent numeric">{{ percentage }}%</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-bar__fill"
        :style="{ width: percentage + '%' }"
      />
    </div>
    <p
      v-if="description"
      class="progress-goal__desc"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({ title: String, percentage: Number, description: String })
</script>