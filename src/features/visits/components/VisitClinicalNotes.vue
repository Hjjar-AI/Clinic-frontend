<template>
  <CollapsibleSection
    title="ملاحظات سريرية"
    icon="brain"
    :open="true"
    persist-key="visit-clinical"
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
          class="form-control"
          rows="2"
        />
      </FormField>
      <FormField label="العوامل المسببة">
        <textarea
          v-model="form.formulation_precipitating"
          class="form-control"
          rows="2"
        />
      </FormField>
      <FormField label="العوامل المستمرة">
        <textarea
          v-model="form.formulation_perpetuating"
          class="form-control"
          rows="2"
        />
      </FormField>
      <FormField label="العوامل الوقائية">
        <textarea
          v-model="form.formulation_protective"
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
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import FormField from '@/components/ui/FormField.vue'
import FormTextarea from '@/components/ui/FormTextarea.vue'
import ScaleRenderer from '@/features/clinical/components/ScaleRenderer.vue'

defineProps({
  form: Object,
  scales: Array
})

defineEmits(['add-scale', 'remove-scale', 'update-scale-field'])
</script>