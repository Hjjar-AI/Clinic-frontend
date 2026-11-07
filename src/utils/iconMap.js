// frontend/src/utils/iconMap.js
/**
 * Canonical icon mapping – one icon per recurring concept.
 */
export const ICON_MAP = {
  // Patients
  patient: 'user',
  patients: 'users',
  addPatient: 'user-plus',
  patientFile: 'folder-user',

  // Visits
  visit: 'notes-medical',
  addVisit: 'file-medical',
  visitHistory: 'history',

  // Appointments
  appointment: 'calendar-check',
  appointments: 'calendar-alt',
  addAppointment: 'calendar-plus',

  // Tasks
  task: 'tasks',
  addTask: 'task-plus',

  // Clinical
  diagnosis: 'diagnoses',
  medication: 'pills',
  prescription: 'prescription',
  lab: 'flask',
  vital: 'heartbeat',
  risk: 'shield-alt',
  safety: 'hard-hat',

  // Plural/entity names used in EmptyState and elsewhere
  diagnoses: 'diagnoses',
  medications: 'pills',
  charts: 'chart-pie',
  scales: 'chart-line',
  users: 'users',
  invoices: 'file-invoice',
  templates: 'file-alt',
  // Aliases
  'user-cog': 'user-cog',
  'user-md': 'user-md',
  'user-tie': 'user-tie',
  'clinic-medical': 'clinic-medical',
  'file-invoice': 'file-invoice',

  // Actions
  edit: 'edit',
  delete: 'trash',
  view: 'eye',
  download: 'download',
  upload: 'upload',
  print: 'print',
  export: 'file-export',
  import: 'file-import',
  save: 'save',
  cancel: 'times',
  confirm: 'check',
  search: 'search',
  filter: 'filter',
  clear: 'times-circle',
  refresh: 'sync',
  lock: 'lock',
  unlock: 'unlock',

  // Navigation
  dashboard: 'tachometer-alt',
  reports: 'chart-line',
  settings: 'cog',
  notifications: 'bell',
  help: 'question-circle',
  info: 'info-circle',
  warning: 'exclamation-triangle',
  danger: 'exclamation-circle',
  success: 'check-circle',

  // Users
  user: 'user',
  doctor: 'user-md',
  admin: 'crown',
  receptionist: 'user-tie',

  // Empty states / common
  welcome: 'smile',
  inbox: 'inbox',
  calendar: 'calendar-alt',
  clock: 'clock',
  'chart-pie': 'chart-pie',
  'file-alt': 'file-alt',
  'pills': 'pills',
}
