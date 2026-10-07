<template>
  <div
    ref="container"
    class="form-group"
    :class="{
      'form-group--required': required,
      'form-group--optional': optional,
      'has-error': !!error,
      'has-success': valid && !error
    }"
  >
    <label
      v-if="label"
      :for="associatedFieldId"
      class="form-group__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="required-asterisk"
        aria-hidden="true"
      >*</span>
    </label>
    <slot />
    <small
      v-if="help && !error"
      class="form-help"
    >{{ help }}</small>
    <FieldError
      v-if="error"
      :error="error"
    />
    <small
      v-if="valid && !error"
      class="form-success"
    >
      <Icon
        icon="check-circle"
        class="form-success-icon"
      />
    </small>
  </div>
</template>

<script setup>
import { onMounted, onUpdated, ref, useId } from 'vue'

import FieldError from './FieldError.vue'
import Icon from './Icon.vue'

const props = defineProps({
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  fieldId: { type: String, default: '' },
  valid: { type: Boolean, default: false }
})

const container = ref(null)
const fallbackId = `field-${useId()}`
const associatedFieldId = ref(props.fieldId || fallbackId)

function associateControl() {
  const control = container.value?.querySelector('input, select, textarea')
  if (!control) return
  if (!control.id) control.id = props.fieldId || fallbackId
  associatedFieldId.value = control.id
}

onMounted(associateControl)
onUpdated(associateControl)
</script>

<style scoped>
.form-group { margin-bottom: var(--spacing-form-group); }
.form-group__label {
  display: block; font-weight: var(--font-weight-semibold);
  font-size: var(--text-sm); margin-bottom: var(--space-1);
  color: var(--color-text-soft);
}
.required-asterisk { color: var(--color-danger); margin-inline-start: var(--space-0-5); font-weight: var(--font-weight-bold); }
.form-help { display: block; margin-top: var(--space-1); font-size: var(--text-xs); color: var(--color-text-soft); line-height: var(--line-height-normal); }
.has-error .form-group__label { color: var(--color-danger); }
.has-success .form-group__label { color: var(--color-success); }
.form-success {
  display: flex; align-items: center; gap: var(--space-1);
  margin-top: var(--space-1); font-size: var(--text-xs); color: var(--color-success);
}
.form-success-icon { font-size: var(--text-xs); }
</style>
