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

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'مجدول',
  confirmed: 'مؤكد',
  arrived: 'وصل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  'no-show': 'غائب',
}

export const TASK_STATUS_LABELS = {
  open: 'مفتوحة',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export const VISIT_STATUS_LABELS = {
  draft: 'مسودة',
  final: 'نهائية',
  amended: 'معدلة',
  locked: 'مقفلة',
}

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

export const INVOICE_STATUS_LABELS = {
  draft: 'مسودة',
  issued: 'صادرة',
  paid: 'مدفوعة',
  cancelled: 'ملغية',
  overdue: 'متأخرة',
}

export const RISK_LEVELS = {
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low',
}

// Clinical constants for validators
export const SUICIDE_RISK_LEVELS = ['Low', 'Moderate', 'High']
export const VIOLENCE_RISK_LEVELS = ['Low', 'Moderate', 'High']
export const LEVEL_OF_CARE = [
  'Outpatient', 'IOP', 'PHP', 'Inpatient', 'Residential',
  'Voluntary', 'Involuntary'
]
export const FOLLOW_UP_TYPE = ['In-person', 'Telehealth', 'Phone']

export const GENDER_MALE = 'ذكر'
export const GENDER_FEMALE = 'أنثى'
export const GENDER_VALUES = [GENDER_MALE, GENDER_FEMALE]

export const MARITAL_STATUS_MALE = ['أعزب', 'متزوج', 'مطلق', 'أرمل']
export const MARITAL_STATUS_FEMALE = ['عزباء', 'متزوجة', 'مطلقة', 'أرملة']
