<template>
  <select
    :value="modelValue"
    class="form-control form-control--select"
    :aria-label="field.placeholder || 'تصفية حسب الحالة'"
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
</template>

<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number], default: '' },
})

defineEmits(['update:modelValue'])
</script>
