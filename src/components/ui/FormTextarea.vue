<template>
  <FormField
    :label="label"
    :required="required"
    :error="error"
    :help="help"
    :field-id="computedId"
  >
    <textarea
      :id="computedId"
      ref="textareaEl"
      v-model="modelValue"
      class="form-control form-control--textarea"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :required="required"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      @input="autoResize"
    />
    <small
      v-if="maxlength"
      class="char-counter text-xs"
      :class="counterClass"
    >
      {{ modelValue.length }}/{{ maxlength }}
      <span
        v-if="modelValue.length >= maxlength * 0.9"
        class="text-warning"
      >
        <Icon icon="exclamation-circle" /> يقترب من الحد الأقصى
      </span>
    </small>
  </FormField>
</template>

<script setup>
import { computed,ref, useId } from 'vue'

import Icon from '@/components/ui/Icon.vue'

import FormField from './FormField.vue'

const props = defineProps({
  rows:        { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
  maxlength:   { type: Number, default: null },
  label:        { type: String, default: '' },
  required:     { type: Boolean, default: false },
  error:        { type: String, default: '' },
  help:         { type: String, default: '' },
  fieldId:      { type: String, default: '' },
  disabled:     { type: Boolean, default: false },
})

const fallbackId = `textarea-${useId()}`
const computedId = computed(() => props.fieldId || fallbackId)
const modelValue = defineModel({ type: String, default: '' })
const textareaEl = ref(null)

// Guard on `props.maxlength` first. The old computed referenced
// `props.maxlength * 0.9` and `>= props.maxlength` even when maxlength
// was null, which coerced to `>= 0` — always true. The template's
// `v-if="maxlength"` masked the bug today, but the computed was eager
// and would misfire the moment someone rendered the class elsewhere.
const counterClass = computed(() => {
  if (!props.maxlength) return 'text-muted'
  const len = (modelValue.value || '').length
  if (len >= props.maxlength) return 'text-danger'
  if (len >= props.maxlength * 0.9) return 'text-warning'
  return 'text-muted'
})

function autoResize() {
  if (!textareaEl.value) return
  textareaEl.value.style.height = 'auto'
  textareaEl.value.style.height = textareaEl.value.scrollHeight + 'px'
}
</script>

<style scoped src="../../styles/components/ui/form-textarea.css"></style>
