<!-- frontend/src/components/ui/ConfirmDialog.vue -->
<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    :header-variant="headerVariant"
    size="sm"
    @update:model-value="handleVisibilityChange"
  >
    <slot />
    <div
      v-if="input"
      class="form-group mt-3"
    >
      <label :for="inputId">
        <span>{{ input.label }}</span>
        <textarea
          :id="inputId"
          ref="inputElement"
          v-model.trim="inputValue"
          class="form-control"
          rows="3"
          :required="input.required"
          :maxlength="input.maxLength"
        />
      </label>
    </div>
    <div
      v-if="requireCheckbox"
      class="mt-3"
    >
      <label
        class="checkbox"
        :for="checkboxId"
      >
        <input
          :id="checkboxId"
          v-model="checkboxChecked"
          type="checkbox"
          class="checkbox__input"
        >
        <span>{{ checkboxLabel }}</span>
      </label>
    </div>
    <template #footer>
      <button
        class="btn btn--secondary"
        @click="$emit('cancel')"
      >
        {{ cancelText }}
      </button>
      <button
        class="btn btn--primary"
        :disabled="(requireCheckbox && !checkboxChecked) || (input?.required && !inputValue)"
        @click="$emit('confirm', input ? inputValue : true)"
      >
        {{ confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { nextTick, ref, useId, watch } from 'vue'

import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'تأكيد' },
  confirmText: { type: String, default: 'نعم' },
  cancelText: { type: String, default: 'إلغاء' },
  requireCheckbox: { type: Boolean, default: false },
  checkboxLabel: { type: String, default: 'أفهم العواقب' },
  headerVariant: { type: String, default: 'warning' },
  input: { type: Object, default: null },
})

const emit = defineEmits(['confirm', 'cancel', 'update:modelValue'])

const checkboxChecked = ref(false)
const inputValue = ref('')
const inputElement = ref(null)
const inputId = `confirm-input-${useId()}`
const checkboxId = `confirm-checkbox-${useId()}`

watch(() => props.modelValue, (val) => {
  if (!val) {
    checkboxChecked.value = false
    inputValue.value = ''
  } else if (props.input) {
    nextTick(() => inputElement.value?.focus())
  }
}, { immediate: true })

function handleVisibilityChange(value) {
  emit('update:modelValue', value)
  if (!value) emit('cancel')
}
</script>
