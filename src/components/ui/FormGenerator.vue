<template>
  <form @submit.prevent="$emit('submit')">
    <div
      v-for="field in fields"
      :key="field.name"
      class="form-group"
    >
      <FormField
        :label="field.label"
        :required="field.required"
        :error="errors?.[field.name]"
        :help="field.help"
        :field-id="`generated-${field.name}`"
      >
        <!-- Text / number / email / password -->
        <input
          v-if="['text','number','email','password'].includes(field.type)"
          :id="`generated-${field.name}`"
          v-model="form[field.name]"
          :type="field.type"
          class="form-control"
          :placeholder="field.placeholder"
          :required="field.required"
          :aria-invalid="Boolean(errors?.[field.name])"
        >
        <!-- Select -->
        <select
          v-else-if="field.type === 'select'"
          :id="`generated-${field.name}`"
          v-model="form[field.name]"
          class="form-control form-control--select"
          :required="field.required"
          :aria-invalid="Boolean(errors?.[field.name])"
        >
          <option
            v-if="field.placeholder"
            value=""
            disabled
          >
            {{ field.placeholder }}
          </option>
          <option
            v-for="opt in field.options"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
        <!-- Textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="`generated-${field.name}`"
          v-model="form[field.name]"
          class="form-control form-control--textarea"
          :rows="field.rows || 3"
          :placeholder="field.placeholder"
          :required="field.required"
          :aria-invalid="Boolean(errors?.[field.name])"
        />
        <!-- Date -->
        <FormDate
          v-else-if="field.type === 'date'"
          v-model="form[field.name]"
          :field-id="`generated-${field.name}`"
        />
        <!-- Custom slot -->
        <slot
          v-else
          :name="field.name"
          :field="field"
          :value="form[field.name]"
        />
      </FormField>
    </div>
    <slot name="actions">
      <FormActions
        :submitting="submitting"
        submit-text="حفظ"
        cancel-text="إلغاء"
        @cancel="$emit('cancel')"
      />
    </slot>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

import FormActions from './FormActions.vue'
import FormDate from './FormDate.vue'
import FormField from './FormField.vue'

const props = defineProps({
  fields: { type: Array, required: true },
  modelValue: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const form = reactive({ ...props.modelValue })
// Sync back to parent
import { watch } from 'vue'
watch(form, (val) => emit('update:modelValue', { ...val }), { deep: true })
</script>
