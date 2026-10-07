<template>
  <div class="progress">
    <div
      v-if="label || showPercent"
      class="progress__header"
    >
      <span
        v-if="label"
        class="progress__label"
      >{{ label }}</span>
      <span
        v-if="showPercent && !segments"
        class="progress__percent"
      >{{ percent }}%</span>
    </div>

    <!-- Single bar (default) -->
    <div
      v-if="!segments"
      class="progress__bar"
      role="progressbar"
      :aria-label="label || 'التقدم'"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="percent"
    >
      <div
        class="progress__fill"
        :style="{ width: percent + '%' }"
      />
    </div>

    <!-- Segmented bar -->
    <div
      v-else
      class="progress__bar progress__bar--segments"
    >
      <div
        v-for="(seg, idx) in segments"
        :key="idx"
        class="progress__segment"
        :style="{ width: seg.percentage + '%', backgroundColor: seg.color }"
      >
        <span class="progress__segment-label">{{ seg.label }} {{ seg.percentage }}%</span>
      </div>
    </div>

    <p
      v-if="description"
      class="progress__desc"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  percent: { type: Number, default: 0 },
  segments: { type: Array, default: null },   // [{ percentage, color, label }]
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  showPercent: { type: Boolean, default: true }
})
</script>
