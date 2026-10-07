<template>
  <CollapsibleSection
    title="التشخيصات والتحاليل"
    icon="flask"
    :open="true"
    persist-key="visit-diag"
  >
    <MultiSelect
      v-model="form.diagnoses"
      mode="inline"
      :search-fn="searchDiagnosesFn"
      :option-label="(d) => d.arabic_name || d.english_name || d.code"
      :option-key="(d) => d.id || d.code"
      :initial-options="diagnosesInitial"
      placeholder="ابحث عن تشخيص..."
      custom-label="تشخيص مخصص"
    />
    <DynamicRowList
      v-model="form.lab_values"
      :fields="labFields"
      :options-map="labStatusOptions"
    />
  </CollapsibleSection>
</template>

<script setup>
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import DynamicRowList from '@/components/ui/DynamicRowList.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'

defineProps({
  form: Object,
  searchDiagnosesFn: Function,
  diagnosesInitial: Array,
})

const labFields = [
  { key: 'name', label: 'اسم التحليل', placeholder: 'اسم التحليل' },
  { key: 'value', label: 'النتيجة', placeholder: 'القيمة' },
  { key: 'unit', label: 'الوحدة', placeholder: 'الوحدة' },
  { key: 'reference_range', label: 'المجال المرجعي', placeholder: 'المجال المرجعي' },
  {
    key: 'status', label: 'حالة النتيجة', type: 'select', placeholder: 'الحالة',
  },
  { key: 'date', label: 'تاريخ التحليل', type: 'date', placeholder: 'التاريخ' },
]

const labStatusOptions = {
  status: [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'normal', label: 'طبيعي' },
    { value: 'abnormal', label: 'غير طبيعي' },
    { value: 'critical', label: 'حرج' },
  ],
}
</script>
