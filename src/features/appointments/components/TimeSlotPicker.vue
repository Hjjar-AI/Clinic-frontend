<!-- frontend/src/components/appointment/TimeSlotPicker.vue -->
<template>
  <FormField
    :label="label"
    :required="required"
    :error="error"
  >
    <select
      :value="modelValue"
      class="form-control form-control--select"
      aria-label="وقت الموعد"
      :disabled="loading || disabled"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option
        value=""
        disabled
      >
        {{ placeholder }}
      </option>
      <option
        v-for="slot in slots"
        :key="slot.time"
        :value="slot.time"
        :disabled="!slot.available && slot.time !== currentValue"
      >
        {{ slot.time }} {{ slot.available ? '' : (slot.time === currentValue ? '(الموعد الحالي)' : '(محجوز)') }}
      </option>
      <option
        v-if="modelValue && modelValue === currentValue && !slots.some(s => s.time === modelValue)"
        :value="modelValue"
        selected
      >
        {{ modelValue }} (الموعد الحالي)
      </option>
    </select>
    <small
      v-if="loading"
      class="text-muted"
    >جاري تحميل المواعيد...</small>
    <small
      v-if="!loading && slots.length === 0"
      class="text-muted"
    >لا توجد مواعيد متاحة في هذا التاريخ</small>
  </FormField>
</template>

<script setup>
import { onBeforeUnmount,ref, watch } from 'vue'

import FormField from '@/components/ui/FormField.vue'
import { useDate } from '@/composables/useDate'
import apiClient from '@/services/apiClient'

const props = defineProps({
  modelValue: { type: String, default: '' },
  doctorId: { type: [Number, String], default: null },
  date: { type: String, default: '' },
  duration: { type: Number, default: 30 },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  placeholder: { type: String, default: 'اختر الوقت' },
  disabled: { type: Boolean, default: false },
  currentValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const slots = ref([])
const loading = ref(false)
let cancelTokenSource = null
const { parseDate, toISODate } = useDate()

async function fetchSlots() {
  if (!props.doctorId || !props.date) return

  if (cancelTokenSource) {
    cancelTokenSource.cancel('New slots request')
  }
  const source = apiClient.CancelToken.source()
  cancelTokenSource = source

  loading.value = true
  try {
    // Convert date from any format to ISO (yyyy-mm-dd) before sending
    const parsedDate = parseDate(props.date)
    const isoDate = parsedDate ? toISODate(parsedDate) : props.date

    const { data } = await apiClient.get('/appointments/availability', {
      params: { doctor_id: props.doctorId, date: isoDate, duration: props.duration },
      cancelToken: source.token
    })
    const inner = data?.data || data
    slots.value = inner?.slots || []
    const selected = slots.value.find(slot => slot.time === props.modelValue)
    if (props.modelValue && props.modelValue !== props.currentValue && (!selected || !selected.available)) {
      emit('update:modelValue', '')
    }
  } catch (e) {
    if (!apiClient.isCancel(e)) {
      console.error('Failed to load slots', e)
      slots.value = []
    }
  } finally {
    if (cancelTokenSource === source) {
      loading.value = false
      cancelTokenSource = null
    }
  }
}

watch(() => [props.doctorId, props.date, props.duration], fetchSlots, { immediate: true })

onBeforeUnmount(() => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Component unmounted')
  }
})
</script>
