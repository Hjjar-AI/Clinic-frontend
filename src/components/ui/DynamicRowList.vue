<template>
  <div>
    <div
      v-for="(row, idx) in modelValue"
      :key="row._key || row.id || idx"
      class="dynamic-row flex gap-2 mb-2"
    >
      <template
        v-for="field in fields"
        :key="field.key"
      >
        <input
          v-if="field.type !== 'select'"
          :value="row[field.key]"
          :type="field.type || 'text'"
          :placeholder="field.placeholder || ''"
          class="form-control flex--1"
          :aria-label="field.label || field.placeholder || field.key"
          @input="updateField(idx, field.key, $event.target.value)"
        >
        <select
          v-else-if="field.type === 'select'"
          :value="row[field.key]"
          class="form-control flex--1"
          :aria-label="field.label || field.placeholder || field.key"
          @change="updateField(idx, field.key, $event.target.value)"
        >
          <option value="">
            {{ field.placeholder || 'اختر...' }}
          </option>
          <option
            v-for="opt in getOptions(field)"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </template>
      <BaseButton
        variant="ghost"
        size="xs"
        icon="trash"
        title="حذف"
        aria-label="حذف الصف"
        @click="remove(idx)"
      />
    </div>
    <BaseButton
      variant="secondary"
      size="sm"
      @click="add"
    >
      <Icon icon="plus" /> إضافة
    </BaseButton>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'

import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  fields: { type: Array, required: true },
  optionsMap: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

// Monotonic counter so every newly-added row gets a stable, unique key.
// Rows loaded from the server won't have `_key`, so the template falls back
// to `row.id` and finally the loop index.
let uidCounter = 0
function nextKey() {
  return `drl-${Date.now()}-${++uidCounter}`
}

function add() {
  const newRow = { _key: nextKey() }
  props.fields.forEach((f) => { newRow[f.key] = '' })
  emit('update:modelValue', [...props.modelValue, newRow])
}

function remove(idx) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== idx))
}

// Never mutate `row` in place — build a new array with a shallow-cloned row.
// Keeps the prop one-way and gives Vue a fresh reference per change.
function updateField(idx, key, value) {
  const next = props.modelValue.map((row, i) =>
    i === idx ? { ...row, [key]: value } : row
  )
  emit('update:modelValue', next)
}

function getOptions(field) {
  const opts = props.optionsMap[field.key]
  if (typeof opts === 'function') return opts()
  return opts || []
}
</script>
