<template>
  <div
    class="form-container"
    :class="`max-width-${width}`"
  >
    <BackLink
      v-if="backLabel || showBackLink"
      :label="backLabel || 'العودة'"
    />
    <BaseCard>
      <template
        v-if="headerTitle"
        #header
      >
        <CardHeader
          :variant="headerVariant"
          :icon="headerIcon"
          :title="headerTitle"
        />
      </template>
      <FormErrorSummary :errors="validationErrors" />
      <ResourceFeedback :loading="!ready" :error="loadError" retryable @retry="$emit('retry')" />
      <form @submit.prevent="ready && $emit('submit')">
        <fieldset class="form-load-fields" :disabled="!ready">
        <slot />
        <FormActions
          :submitting="submitting"
          :submit-text="submitText"
          :loading-text="loadingText"
          :submit-variant="submitVariant"
          :submit-icon="submitIcon"
          :cancel-text="cancelText"
          :cancel-to="cancelTo"
          :cancel-fn="cancelFn"
          @cancel="$emit('cancel')"
        />
        </fieldset>
      </form>
      <AlertBar v-if="submitError" severity="danger" :title="submitError" role="alert" class="mt-3" />
    </BaseCard>
  </div>
</template>

<script setup>
import BackLink from './BackLink.vue'
import BaseCard from './BaseCard.vue'
import CardHeader from './CardHeader.vue'
import FormActions from './FormActions.vue'
import ResourceFeedback from './ResourceFeedback.vue'
import AlertBar from './AlertBar.vue'
import FormErrorSummary from './FormErrorSummary.vue'

defineProps({
  ready: { type: Boolean, default: true },
  loadError: { type: String, default: '' },
  width: { type: String, default: 'lg' },
  backLabel: { type: String, default: '' },
  showBackLink: { type: Boolean, default: true },
  headerVariant: { type: String, default: 'primary' },
  headerIcon: { type: String, default: 'file-alt' },
  headerTitle: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  submitText: { type: String, default: 'حفظ' },
  loadingText: { type: String, default: 'جاري الحفظ...' },
  submitVariant: { type: String, default: 'primary' },
  submitIcon: { type: String, default: 'save' },
  cancelText: { type: String, default: 'إلغاء' },
  cancelTo: { type: [String, Object], default: null },
  cancelFn: { type: Function, default: null },
  validationErrors: { type: Object, default: () => ({}) },
  submitError: { type: String, default: '' },
})

defineEmits(['submit', 'cancel', 'retry'])
</script>
