<template>
  <div class="avail-grid" :style="{ '--doctor-columns': Math.max(1, doctors.length) }">
    <div class="avail-grid__row avail-grid__header">
      <div class="avail-grid__time" />
      <div
        v-for="doc in doctors"
        :key="doc.id"
        class="avail-grid__doctor"
      >
        {{ doc.name }}
      </div>
    </div>
    <div
      v-for="slot in timeSlots"
      :key="slot"
      class="avail-grid__row"
    >
      <div class="avail-grid__time numeric">
        {{ slot }}
      </div>
      <button
        v-for="doc in doctors"
        :key="doc.id"
        class="avail-grid__cell"
        :class="cellClass(doc.id, slot)"
        :disabled="!isFree(doc.id, slot)"
        type="button"
        @click="cellClick(doc.id, slot)"
      >
        {{ cellLabel(doc.id, slot) }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  doctors: { type: Array, required: true },
  timeSlots: { type: Array, required: true },
  bookings: { type: Array, default: () => [] }
})
const emit = defineEmits(['select'])

function isFree(doctorId, time) {
  return !props.bookings.some(b => b.doctorId === doctorId && b.time === time)
}

function cellClass(doctorId, time) {
  return isFree(doctorId, time) ? 'avail-grid__cell--free' : 'avail-grid__cell--booked'
}

function cellLabel(doctorId, time) {
  return isFree(doctorId, time) ? 'متاح' : 'محجوز'
}

function cellClick(doctorId, time) {
  if (isFree(doctorId, time)) emit('select', { doctorId, time })
}
</script>