<template>
  <div :class="`filter-bar filter-bar--${variant}`">
    <div class="filter-bar__fields">
      <div
        v-for="field in fields"
        :key="field.key"
        class="filter-bar__field"
      >
        <FilterField
          :field="field"
          :model-value="modelValue[field.key]"
          :filter-values="modelValue"
          @update:model-value="(v) => updateField(field.key, v)"
          @update:range="updateRange"
        />
      </div>
    </div>
    <div class="filter-bar__actions">
      <BaseButton
        variant="secondary"
        size="sm"
        @click="$emit('apply')"
      >
        تطبيق
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        @click="$emit('reset')"
      >
        مسح
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import FilterField from './FilterField.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, required: true },
  variant: { type: String, default: 'bar', validator: v => ['bar','panel'].includes(v) }
})

const emit = defineEmits(['update:modelValue', 'apply', 'reset'])

function updateField(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function updateRange(values) {
  emit('update:modelValue', { ...props.modelValue, ...values })
}
</script>
