<template>
  <FormWrapper
    :header-title="isEdit ? 'تعديل بيانات المريض' : 'فتح ملف طبي جديد'"
    header-icon="user-plus"
    :back-label="isEdit ? 'العودة للملف' : 'العودة للقائمة'"
    :submitting="submitting"
    :submit-text="isEdit ? 'تحديث السجل الطبي' : 'حفظ وإنشاء الملف'"
    :cancel-fn="$emit('cancel')"
    :validation-errors="errors"
    :submit-error="submitError"
    @submit="$emit('submit')"
    @cancel="$emit('cancel')"
  >
    <template #headerTitle>
      <Breadcrumb />
    </template>

    <PatientFormDemographics
      :form="form"
      :errors="errors"
      :field-states="fieldStates"
      :gender-options="genderOptions"
      :year-options="yearOptions"
      :marital-status-options="maritalStatusOptions"
    />
    <PatientFormSocial
      :form="form"
      :errors="errors"
      :field-states="fieldStates"
    />
    <PatientFormMedical :form="form" />
  </FormWrapper>
</template>

<script setup>
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import PatientFormDemographics from '@/features/patients/components/PatientFormDemographics.vue'
import PatientFormMedical from '@/features/patients/components/PatientFormMedical.vue'
import PatientFormSocial from '@/features/patients/components/PatientFormSocial.vue'

defineProps({
  isEdit: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
  fieldStates: { type: Object, default: () => ({}) },
  submitError: { type: String, default: '' },
  form: { type: Object, required: true },
  genderOptions: { type: Array, required: true },
  yearOptions: { type: Array, required: true },
  maritalStatusOptions: { type: Array, required: true },
})

defineEmits(['submit', 'cancel'])
</script>