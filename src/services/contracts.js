/**
 * Explicit wire types. Read models never become write commands by object spread.
 * @typedef {string} DecimalString Two fractional digits, no exponent.
 * @typedef {'draft'|'final'|'amended'|'locked'} VisitStatus
 * @typedef {'pending'|'completed'|'missed'|'cancelled'|'waived'} FollowUpStatus
 * @typedef {{id:number, patient_number:string, full_name:string, dob_year:number|null, version:number}} PatientSummary
 * @typedef {{id:number, due_date:string, method:string, status:FollowUpStatus, outcome_at:string|null, outcome_by:number|null, completed_revision:number|null}} FollowUpOccurrence
 * @typedef {{description:string, quantity:DecimalString, unit_price:DecimalString}} InvoiceLineInput
 * @typedef {{id:number, version:number, patient:number, visit:number|null, total_amount:DecimalString, final_amount:DecimalString, line_items:Array<InvoiceLineInput & {id:number,amount:DecimalString,order:number}>}} InvoiceResponse
 * @typedef {{patient_id:number,visit_id?:number|null,lines?:InvoiceLineInput[],tax?:DecimalString,discount?:DecimalString,version?:number}} InvoiceCommand
 * @typedef {{id:number,version:number,patient:PatientSummary,status:VisitStatus,follow_up:FollowUpOccurrence|null,clinical_data:Object}} VisitResponse
 * @typedef {{version?:number,visit_date:string,clinical_data?:Object,follow_up_input?:{due_date:string|null,method:string,reason:string},diagnoses_input?:Object[],medications_input?:Object[],lab_values_input?:Object[],scale_responses_input?:Object[]}} VisitCommand
 * @typedef {{kind:string,operation:'save'|'retire'|'select_primary',record_id?:number,fields:Object,reason:string,version:number}} PatientRecordCommand
 */

export const COMMAND_FIELDS = Object.freeze({
  invoice: ['patient_id', 'visit_id', 'total_amount', 'lines', 'tax', 'discount', 'payment_method', 'issued_date', 'due_date', 'notes', 'currency', 'version'],
  patient: ['first_name', 'father_name', 'surname', 'mother_name', 'dob_year', 'gender', 'national_id', 'marital_status', 'occupation', 'permanent_address', 'phone', 'emergency_contact_name', 'emergency_contact_relation', 'emergency_contact_phone', 'family_history', 'important_notes', 'registration_date', 'identity_verification', 'preferred_language', 'preferred_contact_channel', 'communication_restrictions', 'allergy_status', 'medication_status', 'doctor_id', 'care_team_ids', 'correction_reason', 'version'],
  visit: ['patient_id', 'visit_date', 'main_complaints', 'history_presenting_complaint', 'treatment_text', 'doctor_notes', 'clinical_status', 'accompanied_by', 'companion_relation', 'pain_level', 'anxiety_level', 'suicide_risk_level', 'violence_risk_level', 'firearm_access', 'level_of_care', 'care_basis', 'supervisor_id', 'diagnosis_discussed', 'plan_discussed', 'clinical_data', 'follow_up_input', 'diagnoses_input', 'medications_input', 'lab_values_input', 'scale_responses_input', 'status', 'version'],
  appointment: ['patient_id', 'doctor_id', 'appointment_date', 'appointment_time', 'duration_minutes', 'status', 'status_reason', 'notes', 'version'],
  task: ['title', 'description', 'priority', 'due_date', 'assigned_to_id', 'version'],
  user: ['username', 'full_name', 'role', 'is_active', 'stamp_data', 'preferences', 'password', 'version'],
})

export function toCommand(kind, value) {
  const keys = COMMAND_FIELDS[kind]
  if (!keys || !value || typeof value !== 'object') throw new TypeError('Invalid command')
  return Object.fromEntries(keys.filter(key => Object.hasOwn(value, key) && value[key] !== undefined).map(key => [key, value[key]]))
}
