// frontend/src/utils/cacheKeys.js

/**
 * Centralised cache key generation for the frontend.
 * Use these functions instead of hard‑coding string literals.
 */

export const CACHE_PREFIX = {
  DASHBOARD: 'dashboard_stats_',
  REPORTS: 'reports_statistics_',
  CONTEXT_PATIENTS: 'context_patients_',
  CONTEXT_DOCTORS: 'context_doctors',
  CONTEXT_USERS: 'context_users_',
  CONTEXT_APPOINTMENTS: 'context_appointments_',
  SETTINGS: 'setting_',
  IDEMPOTENT: 'idempotent:',
}

export function dashboardKey(userId, role) {
  return `${CACHE_PREFIX.DASHBOARD}${userId}_${role}`
}

export function reportsKey(userId, role) {
  return `${CACHE_PREFIX.REPORTS}${userId}_${role}`
}

export function patientContextKey(userId) {
  return `${CACHE_PREFIX.CONTEXT_PATIENTS}${userId}`
}

export function doctorContextKey() {
  return CACHE_PREFIX.CONTEXT_DOCTORS
}

export function userContextKey() {
  return CACHE_PREFIX.CONTEXT_USERS
}

export function appointmentContextKey() {
  return CACHE_PREFIX.CONTEXT_APPOINTMENTS
}

export function settingKey(key) {
  return `${CACHE_PREFIX.SETTINGS}${key}`
}