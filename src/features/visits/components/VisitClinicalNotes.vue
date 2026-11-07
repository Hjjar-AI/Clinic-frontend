<template>
  <CollapsibleSection
    id="visit-examination"
    tabindex="-1"
    title="ملاحظات سريرية"
    icon="brain"
    :open="sectionOpen"
  >
    <FormTextarea
      v-model="form.mse"
      label="الفحص العقلي (MSE)"
      rows="4"
      placeholder="اكتب ملاحظات الفحص العقلي..."
    />
    <div class="grid-2">
      <FormField label="العوامل المهيئة">
        <textarea
          v-model="form.formulation_predisposing"
          aria-label="العوامل المهيئة"
          class="form-control"
          rows="2"
        />
      </FormField>
      <FormField label="العوامل المسببة">
        <textarea
          v-model="form.formulation_precipitating"
          aria-label="العوامل المسببة"
          class="form-control"
          rows="2"
        />
      </FormField>
      <FormField label="العوامل المستمرة">
        <textarea
          v-model="form.formulation_perpetuating"
          aria-label="العوامل المستمرة"
          class="form-control"
          rows="2"
        />
      </FormField>
      <FormField label="العوامل الوقائية">
        <textarea
          v-model="form.formulation_protective"
          aria-label="العوامل الوقائية"
          class="form-control"
          rows="2"
        />
      </FormField>
    </div>
    <FormTextarea
      v-model="form.risk_notes"
      label="تفاصيل تقييم الخطر"
      rows="3"
    />
    <ScaleRenderer
      :scales="scales"
      @add-scale="$emit('add-scale')"
      @remove-scale="$emit('remove-scale', $event)"
      @update-field="$emit('update-scale-field', $event)"
    />
  </CollapsibleSection>
</template>

<script setup>
import { useVisitSection } from '@/features/visits/composables/useVisitSections'
const sectionOpen = useVisitSection('visit-clinical')
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import FormField from '@/components/ui/FormField.vue'
import FormTextarea from '@/components/ui/FormTextarea.vue'
import ScaleRenderer from '@/features/clinical/components/ScaleRenderer.vue'

defineProps({
  form: { type: Object, required: true },
  scales: { type: Array, default: () => [] },
})

defineEmits(['add-scale', 'remove-scale', 'update-scale-field'])
</script>
