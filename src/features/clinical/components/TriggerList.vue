<template>
  <div class="trigger-list">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="trigger-item"
    >
      <span
        class="trigger-item__dot"
        :class="item.severity === 'high' ? 'trigger-item__dot--high' : 'trigger-item__dot--medium'"
      />
      <div>
        <strong class="trigger-item__title">{{ item.title }}</strong>
        <p
          v-if="item.description"
          class="trigger-item__desc"
        >
          {{ item.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
    // [{ severity: 'high' | 'medium', title: '...', description: '...' }]
  }
})
</script>