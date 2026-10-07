<!-- frontend/src/components/ui/DatePicker.vue -->
<template>
  <FormField
    :label="label"
    :required="required"
    :error="error"
    :help="help"
    :field-id="computedId"
  >
    <div class="relative date-input-wrapper">
      <input
        :id="computedId"
        ref="inputEl"
        :value="modelValue"
        type="text"
        class="form-control form-control--date"
        placeholder="يوم/شهر/سنة"
        :aria-label="label || 'التاريخ'"
        :aria-invalid="Boolean(error)"
        autocomplete="off"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="handleBlur"
      >
      <button
        v-if="modelValue"
        type="button"
        class="date-clear-btn"
        aria-label="مسح التاريخ"
        @click="clear"
      >
        <Icon icon="times" />
      </button>
      <Icon
        icon="calendar"
        class="date-icon"
      />
    </div>
  </FormField>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import FormField from '@/components/ui/FormField.vue'
import Icon from '@/components/ui/Icon.vue'
import { useDate } from '@/composables/useDate'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  fieldId: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const inputEl = ref(null)
const fallbackId = `date-${useId()}`
const computedId = computed(() => props.fieldId || fallbackId)
const { initDatePicker, getFlatpickrDefaults } = useDate()
let flatpickrInstance = null

function addTodayButton(fp) {
  let footer = fp.calendarContainer.querySelector('.flatpickr-footer')
  if (!footer) {
    footer = document.createElement('div')
    footer.className = 'flatpickr-footer'
    fp.calendarContainer.appendChild(footer)
  }
  const btn = document.createElement('button')
  btn.textContent = 'اليوم'
  btn.className = 'flatpickr-today-btn'
  btn.type = 'button'
  btn.addEventListener('click', () => {
    const today = new Date()
    fp.setDate(today, true)
    fp.close()
  })
  footer.appendChild(btn)
}

onMounted(async () => {
  if (inputEl.value) {
    flatpickrInstance = await initDatePicker(inputEl.value, getFlatpickrDefaults({
      defaultDate: props.modelValue || undefined,
      onChange: function(selectedDates, dateStr) {
        emit('update:modelValue', dateStr)
      },
      onReady: function(selectedDates, dateStr, instance) {
        addTodayButton(instance)
      }
    }))
  }
})

onBeforeUnmount(() => {
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
})

watch(() => props.modelValue, (newVal) => {
  if (flatpickrInstance && newVal !== flatpickrInstance.input.value) {
    flatpickrInstance.setDate(newVal, false)
  }
})

function clear() {
  if (flatpickrInstance) {
    flatpickrInstance.clear()
  }
  emit('update:modelValue', '')
}

function handleBlur() { /* optional manual validation */ }
</script>
