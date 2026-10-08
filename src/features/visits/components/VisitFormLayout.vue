<!-- frontend/src/features/visits/components/VisitFormLayout.vue -->
<template>
  <div
    v-if="!patientId && !visitId"
    class="alert alert--danger text-center p-5"
  >
    لا يمكن إنشاء زيارة بدون تحديد المريض.
    <BaseButton
      variant="primary"
      to="/patients"
      class="mt-2"
    >
      العودة إلى قائمة المرضى
    </BaseButton>
  </div>
  <div
    v-else
    class="visit-form-wrapper"
  >
    <Breadcrumb />
    <PageHeader :title="isEdit ? 'تعديل الزيارة' : 'توثيق زيارة جديدة'">
      <p
        v-if="patient"
        class="text-sm m-0 mt-1 visit-patient-info__meta"

      >
        المريض: <strong>{{ fullName }}</strong>
      </p>
    </PageHeader>

    <div class="visit-layout">
      <PatientSummarySidebar
        v-if="patient"
        :patient="patient"
        :latest-visit="latestVisit"
      />

      <BaseCard class="visit-card-main">
        <div class="card__body">
          <form @submit.prevent="$emit('submit')">
            <FormErrorSummary :errors="errors" />

            <VisitBasicInfo
              :form="form"
              :errors="errors"
              :field-states="fieldStates"
              :age-display="ageDisplay"
            />

            <VisitClinicalNotes
              :form="form"
              :scales="addedScales"
              @add-scale="$emit('add-scale')"
              @remove-scale="$emit('remove-scale', $event)"
            />

            <VisitDiagnosesLabs
              :form="form"
              :search-diagnoses-fn="searchDiagnosesFn"
              :diagnoses-initial="diagnosesInitial"
            />

            <VisitTreatmentPlan
              :form="form"
              :search-medications-fn="searchMedicationsFn"
              :medications-initial="medicationsInitial"
              :risk-options="riskOptions"
              :templates="templates"
              @add-goal="$emit('add-goal')"
              @remove-goal="$emit('remove-goal', $event)"
              @apply-template="$emit('apply-template', $event)"
            />

            <VisitAdministrative :form="form" />

            <FormActions
              :submitting="isSubmitting"
              submit-text="حفظ الزيارة"
              loading-text="جاري الحفظ..."
              submit-variant="success"
              submit-icon="check-double"
              :cancel-fn="() => $emit('cancel')"
            />
          </form>
        </div>
      </BaseCard>
    </div>

    <ScalePickerModal
      :model-value="showScalePicker"
      @update:model-value="$emit('update:showScalePicker', $event)"
      @select="$emit('select-scale', $event)"
      @close="$emit('update:showScalePicker', false)"
    />
  </div>
</template>

<script setup>
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormActions from '@/components/ui/FormActions.vue'
import FormErrorSummary from '@/components/ui/FormErrorSummary.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
// Import path updated for the move from components/ui/ → features/patients/components/.
import PatientSummarySidebar from '@/features/patients/components/PatientSummarySidebar.vue'
import VisitAdministrative from '@/features/visits/components/VisitAdministrative.vue'
import VisitBasicInfo from '@/features/visits/components/VisitBasicInfo.vue'
import VisitClinicalNotes from '@/features/visits/components/VisitClinicalNotes.vue'
import VisitDiagnosesLabs from '@/features/visits/components/VisitDiagnosesLabs.vue'
import VisitTreatmentPlan from '@/features/visits/components/VisitTreatmentPlan.vue'

defineProps({
  patientId: { type: [Number, String], default: null },
  visitId: { type: [Number, String], default: null },
  isEdit: { type: Boolean, default: false },
  patient: { type: Object, default: null },
  fullName: { type: String, default: '' },
  latestVisit: { type: Object, default: null },
  form: { type: Object, required: true },
  errors: { type: Object, required: true },
  fieldStates: { type: Object, required: true },
  ageDisplay: { type: String, default: '' },
  addedScales: { type: Array, required: true },
  diagnosesInitial: { type: Array, required: true },
  medicationsInitial: { type: Array, required: true },
  riskOptions: { type: Array, required: true },
  templates: { type: Array, required: true },
  isSubmitting: { type: Boolean, default: false },
  showScalePicker: { type: Boolean, default: false },
  searchDiagnosesFn: { type: Function, required: true },
  searchMedicationsFn: { type: Function, required: true },
})

defineEmits([
  'submit', 'cancel', 'add-scale', 'remove-scale',
  'select-scale', 'add-goal', 'remove-goal', 'apply-template',
  'update:showScalePicker'
])
</script>
