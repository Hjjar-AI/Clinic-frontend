<template>
  <div class="form-actions">
    <p v-if="submitting || error || dirty !== null || saved" class="save-feedback" role="status">{{ error ? 'تعذر الحفظ — تغييراتك ما زالت في النموذج' : submitting ? loadingText : saved ? 'تم الحفظ' : dirty ? 'تغييرات غير محفوظة' : 'لا توجد تغييرات غير محفوظة' }}</p>
    <BaseButton
      type="submit"
      :variant="submitVariant"
      :size="size"
      :disabled="submitting"
      :loading="submitting"
      :icon="submitIcon"
      :default-text="submitText"
      :loading-text="loadingText"
    />
    <button
      v-if="cancelText"
      type="button"
      class="btn btn--secondary"
      @click="handleCancel"
    >
      {{ cancelText }}
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import BaseButton from './BaseButton.vue'

const props = defineProps({
  dirty: { type: Boolean, default: null },
  error: { type: String, default: '' },
  saved: Boolean,
  cancelText: { type: String, default: 'إلغاء' },
  cancelTo: { type: [String, Object], default: null },
  cancelFn: { type: Function, default: null },
  submitting: { type: Boolean, default: false },
  submitText: { type: String, default: 'حفظ' },
  loadingText: { type: String, default: 'جاري الحفظ...' },
  submitVariant: { type: String, default: 'primary' },
  submitIcon: { type: String, default: 'save' },
  size: { type: String, default: 'lg' },
})

const emit = defineEmits(['cancel'])
const router = useRouter()

function handleCancel() {
  if (props.cancelFn) {
    props.cancelFn()
  } else if (props.cancelTo) {
    router.push(props.cancelTo)
  } else {
    emit('cancel')
  }
}
</script>