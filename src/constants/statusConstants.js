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

export const STATUS_TRANSITIONS = {
  appointment: {
    scheduled: ['confirmed', 'arrived', 'cancelled', 'no-show'],
    confirmed: ['arrived', 'cancelled', 'no-show'],
    arrived: ['completed', 'cancelled'],
    completed: [],
    cancelled: ['scheduled'],
    'no-show': ['scheduled'],
  },
  visit: {
    draft: ['final'],
    final: ['amended', 'locked'],
    amended: ['final', 'locked'],
    locked: [],
  },
  task: {
    open: ['in_progress', 'completed', 'cancelled'],
    in_progress: ['open', 'completed', 'cancelled'],
    completed: ['open'],
    cancelled: ['open'],
  },
  invoice: {
    draft: ['issued', 'cancelled'],
    issued: ['paid', 'cancelled'],
    paid: [],
    cancelled: [],
  },
}

export const INVOICE_STATUS_LABELS = statusLabels('invoice')

export const RISK_LEVELS = {
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low',
}

// Clinical constants for validators
export const SUICIDE_RISK_LEVELS = ['Low', 'Moderate', 'High']
export const VIOLENCE_RISK_LEVELS = ['Low', 'Moderate', 'High']
export const LEVEL_OF_CARE = [
  'Outpatient',
  'IOP',
  'PHP',
  'Inpatient',
  'Residential',
]
export const FOLLOW_UP_METHODS = ['In-person', 'Telehealth', 'Phone']

export const GENDER_MALE = 'ذكر'
export const GENDER_FEMALE = 'أنثى'
export const GENDER_VALUES = [GENDER_MALE, GENDER_FEMALE]

export const MARITAL_STATUS_MALE = ['single', 'married', 'divorced', 'widowed']
export const MARITAL_STATUS_FEMALE = [...MARITAL_STATUS_MALE]
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
