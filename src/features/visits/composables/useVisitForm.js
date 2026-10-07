// frontend/src/features/visits/composables/useVisitForm.js
import { computed, onBeforeUnmount,ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { useDate } from '@/composables/useDate'
import { useForm } from '@/composables/useForm'
import { useFormDirty } from '@/composables/useFormDirty'
import { SAFE_DRAFT_FIELDS,useFormDraft } from '@/composables/useFormDraft'
import { useFormSubmission } from '@/composables/useFormSubmission'
import { useVisitStore } from '@/features/visits/stores/visits'
import { RISK_LEVELS } from '@/utils/riskLevels'
import { visitDateRule } from '@/utils/validationRules'

const initialFormData = {
  visit_date: '',
  main_complaints: '',
  history_presenting_complaint: '',
  pain_level: null,
  anxiety_level: null,
  accompanied_by: 'alone',
  companion_relation: '',
  status: 'draft',
  clinical_status: '',
  mse: '',
  formulation_predisposing: '',
  formulation_precipitating: '',
  formulation_perpetuating: '',
  formulation_protective: '',
  risk_notes: '',
  diagnoses: [],
  lab_values: [],
  medications: [],
  goals: [],
  treatment_text: '',
  doctor_notes: '',
  follow_up_date: '',
  suicide_risk_level: null,
  violence_risk_level: null,
  firearm_access: false,
  level_of_care: '',
  follow_up_type: '',
  date_signed: '',
  supervisor_id: '',
  signed_by_id: '',
  diagnosis_discussed: false,
  plan_discussed: false,
  version: 1,
  clinical_data: {},
}

const schema = [visitDateRule()]

export function useVisitForm({ getPatientId, visitId, isEdit, getScalePayload = null }) {
  const router = useRouter()
  const visitStore = useVisitStore()
  const { formatDate, normalizeFormDates, calculateAge, parseDate } = useDate()

  // Pass the visit-specific allow-list into useSession. Previously this
  // list was duplicated inside both files and applied unconditionally as
  // a default, which silently stripped drafts for other forms.
  const {
    draft,
    restoreDraftToForm,
    pauseDraft,
    resumeDraft,
    clearDraft,
  } = useFormDraft({ safeDraftFields: SAFE_DRAFT_FIELDS })

  const patient = ref(null)

  const initial = { ...initialFormData, visit_date: formatDate(new Date()) }
  const { form, errors, fieldStates, isDirty, validate, markClean } = useForm(initial, {
    formId: 'visitForm',
    schema,
  })

  // Single source of truth for dirty state: the ref returned by useForm.
  useFormDirty(isDirty)

  const ageDisplay = computed(() => {
    if (!form.visit_date || !patient.value?.dob_year) return 'سيتم حسابه'
    const age = calculateAge(patient.value.dob_year, parseDate(form.visit_date))
    return age !== null ? `${age} سنة` : 'سيتم حسابه'
  })

  function hydrateFromData(data) {
    Object.assign(form, {
      visit_date: data.visit_date || '',
      main_complaints: data.main_complaints || '',
      history_presenting_complaint: data.history_presenting_complaint || '',
      pain_level: data.pain_level ?? null,
      anxiety_level: data.anxiety_level ?? null,
      accompanied_by: data.accompanied_by || 'alone',
      companion_relation: data.companion_relation || '',
      status: data.status || 'draft',
      clinical_status: data.clinical_status || '',
      treatment_text: data.treatment_text || '',
      doctor_notes: data.doctor_notes || '',
      follow_up_date: data.follow_up_date || '',
      suicide_risk_level: data.suicide_risk_level || null,
      violence_risk_level: data.violence_risk_level || null,
      firearm_access: data.firearm_access || false,
      level_of_care: data.level_of_care || '',
      follow_up_type: data.follow_up_type || '',
      date_signed: data.date_signed || '',
      supervisor_id: data.supervisor || '',
      signed_by_id: data.signed_by || '',
      diagnosis_discussed: data.diagnosis_discussed || false,
      plan_discussed: data.plan_discussed || false,
      version: data.version || 1,
      clinical_data: data.clinical_data || {},
    })

    const clinical = data.clinical_data || {}
    form.mse = clinical.mse || ''
    form.formulation_predisposing = clinical.formulation?.predisposing || ''
    form.formulation_precipitating = clinical.formulation?.precipitating || ''
    form.formulation_perpetuating = clinical.formulation?.perpetuating || ''
    form.formulation_protective = clinical.formulation?.protective || ''
    form.risk_notes = clinical.risk_notes || ''
    form.goals = Array.isArray(clinical.goals)
      ? clinical.goals.map(goal => ({ ...goal }))
      : []

    if (Array.isArray(data.diagnoses)) {
      form.diagnoses = data.diagnoses.map((d) => ({
        id: d.id ?? null,
        code: d.code || '',
        name: d.name || d.english_name || d.custom_name || '',
        arabic_name: d.arabic_name || '',
      }))
    } else {
      form.diagnoses = []
    }

    if (Array.isArray(data.medications)) {
      form.medications = data.medications.map((m) => ({
        id: m.id ?? null,
        name: m.name || m.generic_arabic || m.generic_english || '',
        dosage: m.dosage || '',
        brand: m.brand || '',
        is_custom: !!m.is_custom,
        schedule: m.schedule || '',
      }))
    } else {
      form.medications = []
    }

    form.lab_values = Array.isArray(data.lab_values) ? data.lab_values : []

    // Loaded values are the new dirty baseline.
    markClean()
  }

  function hydrateDuplicateFromData(data) {
    hydrateFromData(data)
    Object.assign(form, {
      visit_date: formatDate(new Date()),
      main_complaints: '',
      history_presenting_complaint: '',
      status: 'draft',
      clinical_status: '',
      mse: '',
      formulation_predisposing: '',
      formulation_precipitating: '',
      formulation_perpetuating: '',
      formulation_protective: '',
      risk_notes: '',
      doctor_notes: '',
      follow_up_date: '',
      suicide_risk_level: null,
      violence_risk_level: null,
      firearm_access: false,
      date_signed: '',
      supervisor_id: '',
      signed_by_id: '',
      diagnosis_discussed: false,
      plan_discussed: false,
      goals: [],
      version: 1,
      clinical_data: {},
    })
  }

  const riskOptions = computed(() =>
    Object.entries(RISK_LEVELS)
      .filter(([key]) => key !== 'null')
      .map(([key, val]) => ({ value: key, label: val.label }))
  )

  function buildPayload() {
    let payload = { ...form }
    payload = normalizeFormDates(payload, ['visit_date', 'follow_up_date', 'date_signed'])

    const clinical = {
      ...(typeof form.clinical_data === 'object' && form.clinical_data !== null
        ? form.clinical_data
        : {}),
      mse: form.mse,
      formulation: {
        predisposing: form.formulation_predisposing,
        precipitating: form.formulation_precipitating,
        perpetuating: form.formulation_perpetuating,
        protective: form.formulation_protective,
      },
      risk_notes: form.risk_notes,
    }
    if (form.goals?.length) clinical.goals = form.goals
    payload.clinical_data = clinical

    payload.diagnoses_input = (payload.diagnoses || []).map((d) => ({
      id: d.id ?? null,
      code: d.code || '',
      name: d.name || d.english_name || d.custom_name || '',
      arabic_name: d.arabic_name || '',
    }))
    payload.medications_input = (payload.medications || []).map((m) => ({
      id: m.id ?? null,
      name: m.name || m.generic_arabic || m.generic_english || '',
      dosage: m.dosage || '',
      brand: m.brand || m.brand_arabic || m.brand_english || '',
      is_custom: !!m.is_custom,
      schedule: m.schedule || '',
    }))
    payload.lab_values_input = payload.lab_values || []

    delete payload.diagnoses
    delete payload.medications
    delete payload.lab_values
    delete payload.mse
    delete payload.formulation_predisposing
    delete payload.formulation_precipitating
    delete payload.formulation_perpetuating
    delete payload.formulation_protective
    delete payload.risk_notes

    payload.supervisor_id = form.supervisor_id || null
    payload.signed_by_id = form.signed_by_id || null
    delete payload.supervisor
    delete payload.signed_by

    if (getScalePayload) {
      payload.scale_responses_input = getScalePayload()
    }

    return payload
  }

  const { execute } = useApi(
    async () => {
      const payload = buildPayload()
      if (isEdit) {
        payload.version = form.version
        await visitStore.updateVisit(visitId, payload)
      } else {
        await visitStore.createVisit(getPatientId(), payload)
      }
      router.push({ name: 'PatientDetail', params: { id: getPatientId() } })
    },
    { silent: true }
  )

  const { submit, submitError, isSubmitting } = useFormSubmission(validate, execute)

  async function handleSubmit() {
    pauseDraft()
    const success = await submit()
    if (success) {
      clearDraft()
      markClean()
    }
    resumeDraft()
    return success
  }

  function cancel() {
    router.push({ name: 'PatientDetail', params: { id: getPatientId() } })
  }

  const stopDraftWatcher = watch(
    () => form,
    (val) => {
      draft.value = val
    },
    { deep: true, immediate: true }
  )
  onBeforeUnmount(() => {
    stopDraftWatcher()
  })

  return {
    form,
    errors,
    fieldStates,
    isDirty,
    validate,
    ageDisplay,
    hydrateFromData,
    hydrateDuplicateFromData,
    patient,
    riskOptions,
    isSubmitting,
    submitError,
    handleSubmit,
    cancel,
    draft,
    restoreDraftToForm,
    SAFE_DRAFT_FIELDS,
    // Kept as an alias for backward compatibility with callers that still
    // destructure it. New code should call `markClean()` on the form.
    resetFormDirty: markClean,
    clearDraft,
    pauseDraft,
    resumeDraft,
  }
}
