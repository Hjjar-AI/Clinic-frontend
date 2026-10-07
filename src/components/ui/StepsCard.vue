<template>
  <div class="steps-card">
    <div
      v-if="title"
      class="steps-card__header"
    >
      <h3 class="steps-card__title">
        {{ title }}
      </h3>
      <p
        v-if="description"
        class="steps-card__desc"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-for="(step, idx) in steps"
      :key="idx"
      class="steps-card__step"
    >
      <div class="steps-card__step-number">
        {{ idx + 1 }}
      </div>
      <div>
        <strong class="steps-card__step-title">{{ step.title }}</strong>
        <p
          v-if="step.description"
          class="steps-card__step-desc"
        >
          {{ step.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  steps: { type: Array, required: true }
})
</script>