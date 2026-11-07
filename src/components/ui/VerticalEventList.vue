<template>
  <div class="vertical-event-list">
    <div class="vertical-event-list__header vertical-event-list__row">
      <div
        v-for="col in columns"
        :key="col.key"
        class="vertical-event-list__cell"
        :class="col.class"
      >
        {{ col.label }}
      </div>
    </div>
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="vertical-event-list__row"
    >
      <div
        v-for="col in columns"
        :key="col.key"
        class="vertical-event-list__cell"
        :class="col.class"
      >
        <slot
          :name="col.key"
          :item="item"
          :index="idx"
        >
          {{ item[col.key] }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  items: { type: Array, required: true },
})
</script>