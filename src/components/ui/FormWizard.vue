<template>
  <div class="form-wizard">
    <StepIndicator
      :steps="steps.map(s => s.title)"
      :current="currentStep"
    />
    <div class="form-wizard__content">
      <Transition
        name="wizard-fade"
        mode="out-in"
      >
        <div
          :key="currentStep"
          class="form-wizard__step"
        >
          <slot :name="`step-${currentStep}`" />
        </div>
      </Transition>
    </div>
    <div class="form-wizard__footer">
      <BaseButton
        v-if="currentStep > 0"
        variant="secondary"
        @click="prev"
      >
        <Icon icon="arrow-right" /> السابق
      </BaseButton>
      <div class="flex--spacer" />
      <BaseButton
        v-if="currentStep < steps.length - 1"
        variant="primary"
        @click="next"
      >
        التالي <Icon icon="arrow-left" />
      </BaseButton>
      <BaseButton
        v-else
        variant="success"
        @click="$emit('finish')"
      >
        <Icon icon="check" /> إنهاء
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import StepIndicator from '@/components/ui/StepIndicator.vue'

const props = defineProps({ steps: { type: Array, required: true }, modelValue: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue', 'finish', 'step-change'])
const currentStep = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  if (val >= 0 && val < props.steps.length) {
    currentStep.value = val
  }
})

function next() { if (currentStep.value < props.steps.length - 1) { currentStep.value++; emit('update:modelValue', currentStep.value); emit('step-change', currentStep.value) } }
function prev() { if (currentStep.value > 0) { currentStep.value--; emit('update:modelValue', currentStep.value); emit('step-change', currentStep.value) } }
</script>

<style scoped>
.form-wizard__content { margin: var(--space-4) 0; }
.form-wizard__footer { display: flex; align-items: center; gap: var(--space-2); padding-top: var(--space-4); border-top: var(--border-width-1) solid var(--color-border-subtle); }
.flex--spacer { flex: 1; }
.wizard-fade-enter-active, .wizard-fade-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);   /* tokenized */
}
.wizard-fade-enter-from { opacity: 0; transform: translateX(20px); }
.wizard-fade-leave-to { opacity: 0; transform: translateX(-20px); }
</style>