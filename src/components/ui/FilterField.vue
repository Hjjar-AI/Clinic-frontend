<template>
  <div class="filter-bar__field">
    <!-- Text input -->
    <input
      v-if="field.type === 'text'"
      :value="modelValue"
      class="form-control"
      :placeholder="field.placeholder || ''"
      :aria-label="field.label || field.placeholder || 'بحث'"
      @input="$emit('update:modelValue', $event.target.value)"
    >

    <!-- Select -->
    <select
      v-else-if="field.type === 'select'"
      :value="modelValue"
      class="form-control form-control--select"
      :aria-label="field.label || field.placeholder || 'تصفية'"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">
        {{ field.placeholder || 'الكل' }}
      </option>
      <option
        v-for="opt in field.options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>

    <!-- ApiSelect -->
    <ApiSelect
      v-else-if="field.type === 'api-select'"
      :model-value="modelValue"
      :url="field.url"
      :value-key="field.valueKey || 'id'"
      :label-key="field.labelKey || 'name'"
      :placeholder="field.placeholder || 'اختر...'"
      label=""
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Date filter (range) -->
    <DateFilter
      v-else-if="field.type === 'date'"
      :field="field"
      :model-value="filterValues"
      @update:model-value="$emit('update:range', $event)"
    />

    <!-- Status filter (dropdown with options) -->
    <StatusFilter
      v-else-if="field.type === 'status'"
      :field="field"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Doctor filter (async dropdown) -->
    <DoctorFilter
      v-else-if="field.type === 'doctor'"
      :field="field"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Patient filter (search) -->
    <PatientFilter
      v-else-if="field.type === 'patient'"
      :field="field"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import DateFilter from '@/components/filters/DateFilter.vue'
import DoctorFilter from '@/components/filters/DoctorFilter.vue'
import PatientFilter from '@/components/filters/PatientFilter.vue'
import StatusFilter from '@/components/filters/StatusFilter.vue'

import ApiSelect from './ApiSelect.vue'

defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number, Object], default: '' },
  filterValues: { type: Object, default: () => ({}) },
})

defineEmits(['update:modelValue', 'update:range'])
</script>
