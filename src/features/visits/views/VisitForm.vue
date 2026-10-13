<!-- frontend/src/features/visits/views/VisitForm.vue -->
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

  <PageContainer v-else status="content" width="standard" class="visit-form-wrapper clinical-readable">
    <Breadcrumb />
    <PageHeader :title="isEdit ? 'تعديل الزيارة' : 'توثيق زيارة جديدة'">
      <p
        v-if="patient"
        class="text-sm m-0 mt-1 visit-patient-info__meta"

      >
        المريض: <strong>{{ fullName(patient) }}</strong>
      </p>
    </PageHeader>

    <PatientWorkspaceHeader v-if="patient" :patient="patient" :status="form.status" />
    <VisitSectionNavigator :form="form" />
    <div class="visit-layout" :class="{ 'visit-layout--split': splitAllowed }">
      <PatientSummarySidebar
        v-if="patient && !splitAllowed"
        :patient="patient"
        :latest-visit="latestVisit"
      />

      <ApprovedVisitReference v-if="patient && splitAllowed" :patient-id="patient.id" :exclude-visit="visitId" />
      <BaseCard class="visit-card-main">
        <div class="card__body">
          <ResourceFeedback :loading="!resourceReady" :error="resourceError" retryable @retry="resource.retry" />
          <form @submit.prevent="handleSubmit">
            <fieldset class="form-load-fields" :disabled="!resourceReady">
            <FormErrorSummary :errors="errors" />
            <AlertBar
              v-if="route.query.duplicateFrom"
              severity="info"
              title="مسودة من زيارة سابقة"
              description="نُسخت التشخيصات والأدوية والتحاليل والخطة ومستويات الألم والقلق. لم تُنسخ الشكوى أو الملاحظات أو المخاطر أو المقاييس أو التوقيعات أو حالة التوثيق، ولن تُنشأ مهام أو إشعارات أو وصفات تلقائياً."
              class="mb-3"
            />
            <AlertBar
              v-if="submitError"
              severity="danger"
              :title="submitError"
              class="mb-3"
            />
            <VisitBasicInfo
              :form="form"
              :errors="errors"
              :field-states="fieldStates"
              :age-display="ageDisplay"
            />
            <VisitClinicalNotes
              :form="form"
              :scales="addedScales"
              @add-scale="addScale"
              @remove-scale="removeScale"
              @update-scale-field="handleScaleFieldUpdate"
            />
            <ResourceFeedback :error="lookupError" retryable @retry="retryLookups" />
            <VisitDiagnosesLabs
              :form="form"
              :search-diagnoses-fn="searchDiagnoses"
              :diagnoses-initial="diagnosesInitial"
            />
            <VisitTreatmentPlan
              :form="form"
              :search-medications-fn="searchMedications"
              :medications-initial="medicationsInitial"
              :risk-options="riskOptions"
              :templates="templates"
              :errors="errors"
              @add-goal="addGoal"
              @remove-goal="removeGoal"
              @apply-template="applyTemplate(form, $event)"
            />
            <VisitAdministrative :form="form" />
            <FormActions :dirty="isDirty" :error="submitError"
              :submitting="isSubmitting"
              submit-text="حفظ الزيارة"
              loading-text="جاري الحفظ..."
              submit-variant="success"
              submit-icon="check-double"
              :cancel-fn="cancel"
            />
          </fieldset>
          </form>
        </div>
      </BaseCard>
    </div>

    <ScalePickerModal
      v-model="showScalePicker"
      @select="onScaleSelected"
      @close="showScalePicker = false"
    />
  </PageContainer>
</template>

<script setup>
import PatientWorkspaceHeader from '@/features/visits/components/PatientWorkspaceHeader.vue'
import VisitSectionNavigator from '@/features/visits/components/VisitSectionNavigator.vue'
import ApprovedVisitReference from '@/features/visits/components/ApprovedVisitReference.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/features/auth/stores/auth'
import PageContainer from '@/components/layout/PageContainer.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useResourceLoad } from '@/composables/useResourceLoad'
import { computed, defineAsyncComponent,onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AlertBar from '@/components/ui/AlertBar.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormActions from '@/components/ui/FormActions.vue'
import FormErrorSummary from '@/components/ui/FormErrorSummary.vue'
// UI components
import PageHeader from '@/components/ui/PageHeader.vue'
import { useNotify } from '@/composables/useNotify'
// Import path updated for the move from components/ui/ → features/patients/components/.
import PatientSummarySidebar from '@/features/patients/components/PatientSummarySidebar.vue'
import { usePatientStore } from '@/features/patients/stores/patients'
import VisitAdministrative from '@/features/visits/components/VisitAdministrative.vue'
import VisitBasicInfo from '@/features/visits/components/VisitBasicInfo.vue'
import VisitClinicalNotes from '@/features/visits/components/VisitClinicalNotes.vue'
import VisitDiagnosesLabs from '@/features/visits/components/VisitDiagnosesLabs.vue'
import VisitTreatmentPlan from '@/features/visits/components/VisitTreatmentPlan.vue'
// Composables
import { useVisitForm } from '@/features/visits/composables/useVisitForm'
import { useVisitLookups } from '@/features/visits/composables/useVisitLookups'
import { useVisitScales } from '@/features/visits/composables/useVisitScales'
import { useVisitTemplates } from '@/features/visits/composables/useVisitTemplates'
import { useVisitStore } from '@/features/visits/stores/visits'
import { useConstantsStore } from '@/stores/constants'
import { fullName } from '@/utils/normalize'

const ScalePickerModal = defineAsyncComponent(
  () => import('@/features/clinical/components/ScalePickerModal.vue')
)

// ── Route params ──────────────────────────────────────────────
const workspace = useWorkspaceStore()
const auth = useAuthStore()
const splitAllowed = computed(() => workspace.preferences.splitView && auth.can('view_visits') && auth.can('export_pdf'))
const route = useRoute()
const router = useRouter()

// `patientId` starts undefined in edit mode and is populated in onMounted
// after the visit loads. Downstream code reads it through `getPatientId()`
// so it always sees the current value.
let patientId = route.params.patientId
const visitId = route.params.id
const isEdit = !!visitId
const resource = useResourceLoad(!isEdit)
const { ready: resourceReady, error: resourceError } = resource

// ── Stores ────────────────────────────────────────────────────
const patientStore = usePatientStore()
const visitStore = useVisitStore()
const constantsStore = useConstantsStore()
const { notify } = useNotify()

// ── Composables ───────────────────────────────────────────────
const {
  showScalePicker, addedScales,
  addScale, onScaleSelected, removeScale,
  hydrateFromVisit: hydrateScales, toPayload: scalesToPayload,
} = useVisitScales()

const {
  form, errors, fieldStates,
  ageDisplay, hydrateFromData, hydrateDuplicateFromData, patient, riskOptions,
  isSubmitting, isDirty, submitError, cancel, handleSubmit: submitVisit,
  restoreDraftToForm, SAFE_DRAFT_FIELDS, resumeDraft,
} = useVisitForm({
  getPatientId: () => patientId,
  visitId,
  isEdit,
  getScalePayload: scalesToPayload,
})

const { templates, applyTemplate } = useVisitTemplates()
const { diagnosesInitial, medicationsInitial, searchDiagnoses, searchMedications, error: lookupError, retry: retryLookups } = useVisitLookups()

async function handleSubmit() { if (resourceReady.value) return submitVisit() }

// ── Computed ──────────────────────────────────────────────────
const latestVisit = computed(() => patient.value?.visits?.[0] || null)

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => resource.load(async (isCurrent) => {
  if (!isEdit && !patientId) {
    router.replace({ name: 'PatientsList' })
    return
  }
  await constantsStore.fetch()

  if (isEdit) {
    try {
      const data = await visitStore.fetchVisit(visitId)
    if (!data?.id || !Number.isInteger(data.version) || data.version < 1) throw new Error('تعذر تحميل إصدار السجل')
      if (!isCurrent()) return
      hydrateFromData(data)
      hydrateScales(data)
      patientId = data.patient_id || data.patient?.id
    } catch {
      throw new Error('تعذر تحميل الزيارة')
    }
  }

  if (!isEdit && route.query.duplicateFrom) {
    try {
      const source = await visitStore.fetchVisit(route.query.duplicateFrom)
      if (!isCurrent()) return
      hydrateDuplicateFromData(source)
      notify('تم تجهيز مسودة من الزيارة السابقة. راجعها ثم احفظها.', 'info')
    } catch {
      notify('تعذر تحميل الزيارة المراد نسخها.', 'warning')
    }
  }

  if (patientId) {
    patient.value = await patientStore.fetchPatient(patientId).catch(() => null)
  }

  if (!isCurrent()) return
  const restored = restoreDraftToForm()
  if (restored) {
    const safe = {}
    for (const key of SAFE_DRAFT_FIELDS) {
      if (key in restored) safe[key] = restored[key]
    }
    Object.assign(form, safe)
    notify('تم استعادة المسودة', 'info', { duration: 3000 })
  }
  if (!isCurrent()) return
  resumeDraft()
}))

// ── Scale field update handler ────────────────────────────────
function handleScaleFieldUpdate({ scaleIndex, fieldId, value }) {
  if (addedScales.value[scaleIndex] && addedScales.value[scaleIndex].fields) {
    const field = addedScales.value[scaleIndex].fields.find(f => f.id === fieldId)
    if (field) {
      field.value = value
    }
  }
}

function addGoal() {
  if (!Array.isArray(form.goals)) form.goals = []
  form.goals.push({ title: '', percentage: 0 })
}

function removeGoal(index) {
  form.goals.splice(index, 1)
}
</script>
