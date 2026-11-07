<!-- frontend/src/components/patient/ColumnVisibilityPanel.vue -->
<template>
  <div
    v-if="visible"
    class="card card--compact mb-3 p-3"
  >
    <div class="flex gap-3 flex--wrap">
      <label
        v-for="col in columns"
        :key="col.key"
        class="checkbox"
      >
        <input
          type="checkbox"
          :checked="col.visible"
          class="checkbox__input"
          :aria-label="`إظهار عمود ${col.label}`"
          @change="$emit('toggle-column', col.key, !col.visible)"
        >
        {{ col.label }}
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  columns: { type: Array, required: true }
})
defineEmits(['toggle-column'])
</script>
