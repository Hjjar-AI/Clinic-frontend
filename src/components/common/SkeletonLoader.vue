<template>
  <div :class="`skeleton skeleton--${type}`">
    <!-- Card -->
    <template v-if="type === 'card'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-line skeleton-title"
      />
    </template>

    <!-- Table row -->
    <template v-if="type === 'table-row'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-row"
      >
        <div
          v-for="j in 4"
          :key="j"
          class="skeleton-cell"
          :style="{ width: `${20 + Math.random()*20}%` }"
        />
      </div>
    </template>

    <!-- Chart -->
    <template v-if="type === 'chart'">
      <div
        class="skeleton-chart"
        :style="{ height: chartHeight + 'px' }"
      />
    </template>

    <!-- Calendar day -->
    <template v-if="type === 'calendar-day'">
      <div class="skeleton-calendar-day">
        <div class="skeleton-header-line" />
        <div
          v-for="i in count"
          :key="i"
          class="skeleton-slot-line"
        />
      </div>
    </template>

    <!-- Appointment list -->
    <template v-if="type === 'appointment-list'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-appt"
      >
        <div class="skeleton-circle" />
        <div class="skeleton-text-lines">
          <div class="skeleton-line w-60" />
          <div class="skeleton-line w-40" />
        </div>
      </div>
    </template>

    <!-- Stats grid -->
    <template v-if="type === 'stats-grid'">
      <div class="skeleton-grid grid-4">
        <div
          v-for="i in 4"
          :key="i"
          class="skeleton-stat-card"
        >
          <div class="skeleton-circle" />
          <div class="skeleton-line w-80" />
          <div class="skeleton-line w-60" />
        </div>
      </div>
    </template>

    <!-- Form skeleton -->
    <template v-if="type === 'form'">
      <div class="skeleton-form">
        <div class="skeleton-line skeleton-title" />
        <div class="skeleton-form__grid">
          <div
            v-for="i in 4"
            :key="i"
            class="skeleton-form__field"
          >
            <div class="skeleton-line w-30" />
            <div class="skeleton-line skeleton-input" />
          </div>
        </div>
        <div class="skeleton-form__textarea">
          <div class="skeleton-line w-30" />
          <div class="skeleton-line skeleton-textarea" />
        </div>
        <div class="skeleton-form__actions">
          <div class="skeleton-btn" />
          <div class="skeleton-btn w-30" />
        </div>
      </div>
    </template>

    <!-- Page skeleton (replaces PageSkeleton) -->
    <template v-if="type === 'page'">
      <div class="page-skeleton">
        <div class="skeleton-block skeleton-header" />
        <div class="skeleton-block skeleton-line" />
        <div class="skeleton-block skeleton-line w-60" />
        <div class="skeleton-block skeleton-line w-80" />
        <div class="skeleton-block skeleton-line w-40" />
        <div class="skeleton-block skeleton-table mt-4">
          <div
            v-for="i in 3"
            :key="i"
            class="skeleton-row"
          >
            <div
              v-for="j in 4"
              :key="j"
              class="skeleton-cell"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'card' },
  count: { type: Number, default: 1 },
  chartHeight: { type: Number, default: 200 }
})
</script>