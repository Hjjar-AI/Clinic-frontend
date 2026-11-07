import { normalizeFormDates } from '@/utils/date'

export const SAFE_DRAFT_FIELDS = [
  'visit_date',
  'accompanied_by',
  'companion_relation',
  'clinical_status',
  'pain_level',
  'anxiety_level',
  'follow_up_due_date',
  'level_of_care',
  'follow_up_method',
  'date_signed',
  'diagnosis_discussed',
  'plan_discussed',
  'selectedTemplate',
]

export function createVisitDefaults(visitDate = '') {
  return {
    visit_date: visitDate,
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
    follow_up_due_date: '',
    follow_up_id: null,
    follow_up_original_due_date: '',
    follow_up_original_method: '',
    follow_up_reason: '',
    suicide_risk_level: null,
    violence_risk_level: null,
    firearm_access: null,
    level_of_care: '',
    care_basis: 'unknown',
    follow_up_method: '',
    date_signed: '',
    supervisor_id: '',
    signed_by_id: '',
    diagnosis_discussed: null,
    plan_discussed: null,
    version: 1,
    clinical_data: {},
  }
}

export function hydrateVisit(data) {
  const form = createVisitDefaults()
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
    follow_up_due_date: data.follow_up?.due_date || '',
    follow_up_id: data.follow_up?.id || null,
    follow_up_original_due_date: data.follow_up?.due_date || '',
    follow_up_original_method: data.follow_up?.method || '',
    follow_up_reason: '',
    suicide_risk_level: data.suicide_risk_level || null,
    violence_risk_level: data.violence_risk_level || null,
    firearm_access: data.firearm_access ?? null,
    level_of_care: data.level_of_care || '',
    care_basis: data.care_basis || 'unknown',
    follow_up_method: data.follow_up?.method || '',
    date_signed: data.date_signed || '',
    supervisor_id: data.supervisor || '',
    signed_by_id: data.signed_by || '',
    diagnosis_discussed: data.diagnosis_discussed ?? null,
    plan_discussed: data.plan_discussed ?? null,
    version: data.version || 1,
    clinical_data: JSON.parse(JSON.stringify(data.clinical_data || {})),
  })

  const clinical = data.clinical_data || {}
  form.mse = clinical.mse || ''
  form.formulation_predisposing = clinical.formulation?.predisposing || ''
  form.formulation_precipitating = clinical.formulation?.precipitating || ''
  form.formulation_perpetuating = clinical.formulation?.perpetuating || ''
  form.formulation_protective = clinical.formulation?.protective || ''
  form.risk_notes = clinical.risk_notes || ''
  form.goals = Array.isArray(clinical.goals)
    ? clinical.goals.map((goal) => ({ ...goal }))
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

  form.lab_values = Array.isArray(data.lab_values)
    ? JSON.parse(JSON.stringify(data.lab_values))
    : []

  return form
}

export function duplicateVisit(data, visitDate) {
  const form = hydrateVisit(data)
  Object.assign(form, {
    visit_date: visitDate,
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
    follow_up_method: '',
    follow_up_due_date: '',
    follow_up_id: null,
    follow_up_original_due_date: '',
    follow_up_original_method: '',
    follow_up_reason: '',
    suicide_risk_level: null,
    violence_risk_level: null,
    firearm_access: null,
    date_signed: '',
    supervisor_id: '',
    signed_by_id: '',
    diagnosis_discussed: null,
    plan_discussed: null,
    goals: [],
    version: 1,
    clinical_data: {},
  })
  return form
}

export function buildVisitCommand(form, getScalePayload = null) {
  let payload = { ...form }
  payload = normalizeFormDates(payload, [
    'visit_date',
    'follow_up_due_date',
    'date_signed',
  ])
  payload.follow_up_input = {
    due_date: payload.follow_up_due_date || null,
    method: payload.follow_up_due_date ? payload.follow_up_method || '' : '',
    reason: form.follow_up_reason || '',
  }
  for (const key of [
    'follow_up_due_date',
    'follow_up_method',
    'follow_up_id',
    'follow_up_original_due_date',
    'follow_up_original_method',
    'follow_up_reason',
  ])
    delete payload[key]
  // The API stores an unassessed risk as the blank choice, while the form
  // uses null for an untouched select. Do not fabricate a negative finding.
  for (const field of ['suicide_risk_level', 'violence_risk_level']) {
    payload[field] = payload[field] ?? ''
  }

  const clinical = {
    ...(typeof form.clinical_data === 'object' && form.clinical_data !== null
      ? form.clinical_data
      : {}),
    schema_version: 1,
    mse: form.mse,
    formulation: {
      predisposing: form.formulation_predisposing,
      precipitating: form.formulation_precipitating,
      perpetuating: form.formulation_perpetuating,
      protective: form.formulation_protective,
    },
    risk_notes: form.risk_notes,
  }
  clinical.goals = (form.goals || []).map((goal) => ({
    title: goal.title,
    percentage: goal.percentage === '' ? null : goal.percentage,
  }))
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
  delete payload.signed_by_id
  delete payload.date_signed
  delete payload.supervisor
  delete payload.signed_by

  if (getScalePayload) {
    payload.scale_responses_input = getScalePayload()
  }

  return payload
}
