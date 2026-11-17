import { reactive } from 'vue'
import { statusLabels } from '@/constants/statusPresentation'
// frontend/src/constants/statusConstants.js

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
}

export const TASK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const VISIT_STATUS = {
  DRAFT: 'draft',
  FINAL: 'final',
  AMENDED: 'amended',
  LOCKED: 'locked',
}

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PAID: 'paid',
  CANCELLED: 'cancelled',
}

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
}

export const APPOINTMENT_STATUS_LABELS = statusLabels('appointment')

export const TASK_STATUS_LABELS = statusLabels('task')

export const VISIT_STATUS_LABELS = statusLabels('visit')

export const STATUS_TRANSITIONS = reactive({ appointment: {}, visit: {}, task: {}, invoice: {} })

export const INVOICE_STATUS_LABELS = statusLabels('invoice')

export const RISK_LEVELS = {
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low',
}

// Clinical constants for validators
export const SUICIDE_RISK_LEVELS = reactive([])
export const VIOLENCE_RISK_LEVELS = reactive([])
export const LEVEL_OF_CARE = reactive([])
export const FOLLOW_UP_METHODS = reactive([])

export const GENDER_MALE = 'ذكر'
export const GENDER_FEMALE = 'أنثى'
export const GENDER_VALUES = [GENDER_MALE, GENDER_FEMALE]

export const MARITAL_STATUS_MALE = reactive([])
export const MARITAL_STATUS_FEMALE = reactive([])
export const MARITAL_STATUS_LABELS = {
  single: { male: 'أعزب', female: 'عزباء', unknown: 'أعزب / عزباء' },
  married: { male: 'متزوج', female: 'متزوجة', unknown: 'متزوج / متزوجة' },
  divorced: { male: 'مطلق', female: 'مطلقة', unknown: 'مطلق / مطلقة' },
  widowed: { male: 'أرمل', female: 'أرملة', unknown: 'أرمل / أرملة' },
}
export function maritalStatusLabel(value, gender = '') {
  return (
    MARITAL_STATUS_LABELS[value]?.[
      gender === GENDER_MALE
        ? 'male'
        : gender === GENDER_FEMALE
          ? 'female'
          : 'unknown'
    ] ||
    value ||
    'غير معروف'
  )
}

export function applyWorkflowChoices(statuses, clinical) {
  for (const domain of ['appointment', 'visit', 'task', 'invoice']) {
    const entries = Object.entries(statuses[`${domain}_status`])
    for (const key of Object.keys(STATUS_TRANSITIONS[domain])) delete STATUS_TRANSITIONS[domain][key]
    for (const [key, definition] of entries) STATUS_TRANSITIONS[domain][key] = definition.allowed_transitions
  }
  for (const [target, key] of [[SUICIDE_RISK_LEVELS, 'suicide_risk_levels'], [VIOLENCE_RISK_LEVELS, 'violence_risk_levels'],
    [LEVEL_OF_CARE, 'level_of_care'], [FOLLOW_UP_METHODS, 'follow_up_methods'], [MARITAL_STATUS_MALE, 'marital_status_male'],
    [MARITAL_STATUS_FEMALE, 'marital_status_female']]) target.splice(0, target.length, ...clinical[key])
}
