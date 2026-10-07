<!-- frontend/src/components/ui/DateRangePicker.vue -->
<template>
  <div class="date-range-picker">
    <div class="date-range-picker__field">
      <div
        v-if="label"
        class="form-group__label"
      >{{ label }}</div>
      <div class="date-range-picker__inputs">
        <input
          :id="`${rangeId}-start`"
          ref="startInput"
          :value="startDate"
          type="text"
          class="form-control form-control--small"
          placeholder="من (يوم/شهر/سنة)"
          autocomplete="off"
          aria-label="بداية الفترة"
          @input="onStartInput"
        >
        <span class="text-muted">–</span>
        <input
          :id="`${rangeId}-end`"
          ref="endInput"
          :value="endDate"
          type="text"
          class="form-control form-control--small"
          placeholder="إلى (يوم/شهر/سنة)"
          autocomplete="off"
          aria-label="نهاية الفترة"
          @input="onEndInput"
        >
        <button
          class="btn btn--secondary btn--sm"
          :disabled="invalidRange"
          @click="emitApply"
        >
          <Icon icon="search" /> تطبيق
        </button>
        <button
          v-if="startDate || endDate"
          class="btn btn--ghost btn--sm"
          @click="clear"
        >
          <Icon icon="cancel" /> مسح
        </button>
      </div>
      <small
        v-if="invalidRange"
        class="text-danger text-xs mt-1"
      >
        تاريخ النهاية يجب أن يكون بعد تاريخ البداية
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount,onMounted, ref, useId } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { useDate } from '@/composables/useDate'

const props = defineProps({
  label: { type: String, default: 'الفترة' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' }
})

const emit = defineEmits(['update:startDate', 'update:endDate', 'apply', 'clear'])
const rangeId = useId()

const startInput = ref(null)
const endInput = ref(null)
const { initDatePicker, getFlatpickrDefaults, toISODate, parseDate } = useDate()

let startFlatpickr = null
let endFlatpickr = null

const invalidRange = computed(() => {
  if (!props.startDate || !props.endDate) return false
  const start = parseDate(props.startDate)
  const end = parseDate(props.endDate)
  if (!start || !end) return false
  return start > end
})

onMounted(async () => {
  if (startInput.value) {
    startFlatpickr = await initDatePicker(startInput.value, getFlatpickrDefaults({
      defaultDate: props.startDate || undefined,
      onChange: (selectedDates, dateStr) => {
        const d = parseDate(dateStr)
        emit('update:startDate', d ? toISODate(d) : dateStr)
      }
    }))
  }
  if (endInput.value) {
    endFlatpickr = await initDatePicker(endInput.value, getFlatpickrDefaults({
      defaultDate: props.endDate || undefined,
      onChange: (selectedDates, dateStr) => {
        const d = parseDate(dateStr)
        emit('update:endDate', d ? toISODate(d) : dateStr)
      }
    }))
  }
})

onBeforeUnmount(() => {
  if (startFlatpickr) {
    startFlatpickr.destroy()
    startFlatpickr = null
  }
  if (endFlatpickr) {
    endFlatpickr.destroy()
    endFlatpickr = null
  }
})

function onStartInput(e) {
  const val = e.target.value
  const d = parseDate(val)
  emit('update:startDate', d ? toISODate(d) : val)
}

function onEndInput(e) {
  const val = e.target.value
  const d = parseDate(val)
  emit('update:endDate', d ? toISODate(d) : val)
}

function emitApply() {
  if (invalidRange.value) return
  emit('apply')
}

function clear() {
  emit('update:startDate', '')
  emit('update:endDate', '')
  emit('clear')
}
</script>
