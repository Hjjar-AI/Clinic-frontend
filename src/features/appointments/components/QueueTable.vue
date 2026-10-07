<template>
  <div class="queue-table">
    <div class="queue-table__header queue-table__row">
      <div class="queue-table__cell">
        الدور
      </div>
      <div class="queue-table__cell">
        اسم المريض
      </div>
      <div class="queue-table__cell">
        نوع الفحص
      </div>
      <div class="queue-table__cell">
        الحالة
      </div>
    </div>
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="queue-table__row"
      :class="{ 'queue-table__row--active': item.active }"
    >
      <div class="queue-table__cell numeric">
        {{ item.token }}
      </div>
      <div class="queue-table__cell">
        {{ item.patientName }}
      </div>
      <div
        class="queue-table__cell"
        :class="{ 'priority-high': item.priority === 'high' }"
      >
        {{ item.examType }}
      </div>
      <div class="queue-table__cell">
        <button
          class="btn btn--dark btn--xs"
          @click="$emit('enter', item)"
        >
          إدخال الآن
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, required: true } })
defineEmits(['enter'])
</script>