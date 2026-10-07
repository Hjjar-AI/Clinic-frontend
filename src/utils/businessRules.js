// frontend/src/utils/businessRules.js

/**
 * All functions are pure – no Vue imports, no side effects.
 * They can be used in composables, components, or even on the server.
 */

/**
 * Calculate approximate age from a birth year and an optional visit date.
 *
 * IMPORTANT: The patient form only collects a birth *year*, not a full date
 * of birth.  This function therefore returns an estimate that can be off by
 * up to one year.  Age‑dependent clinical decisions should not rely solely
 * on this value.
 *
 * @param {number|string} dobYear
 * @param {Date|string} [visitDate]
 * @returns {number|null}
 */
export function calculateAge(dobYear, visitDate = null) {
  if (!dobYear) return null
  const year = visitDate
    ? new Date(visitDate).getFullYear()
    : new Date().getFullYear()
  return year - parseInt(dobYear)
}

/**
 * Return the most recent risk level across suicide and violence.
 *
 * @param {Array} visits – sorted by date descending
 * @returns {string|null} 'High', 'Moderate', 'Low', or null
 */
export function getLatestRiskLevel(visits) {
  if (!visits?.length) return null
  const latest = visits.find(v => v.suicide_risk_level || v.violence_risk_level)
  if (!latest) return null
  if (latest.suicide_risk_level === 'High' || latest.violence_risk_level === 'High') return 'High'
  if (latest.suicide_risk_level === 'Moderate' || latest.violence_risk_level === 'Moderate') return 'Moderate'
  return 'Low'
}

/**
 * Map a risk level to its display label.
 */
export function getRiskLabel(level) {
  const labels = { High: 'مرتفع', Moderate: 'متوسط', Low: 'منخفض' }
  return labels[level] || 'غير محدد'
}

/**
 * Determine if two time intervals overlap.
 * All times are in minutes from midnight.
 */
export function timesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1
}

/**
 * Check if a new appointment (given start time and duration) conflicts
 * with an existing set of occupied intervals.
 *
 * @param {string} newTime - 'HH:MM'
 * @param {number} durationMinutes
 * @param {Array<{start:number, end:number}>} occupied
 * @returns {boolean}
 */
export function isAppointmentConflicting(newTime, durationMinutes, occupied) {
  const [h, m] = newTime.split(':').map(Number)
  const start = h * 60 + m
  const end = start + durationMinutes

  return occupied.some(({ start: s, end: e }) => timesOverlap(start, end, s, e))
}

/**
 * Validate a national ID (10-12 digits).
 * Return true if valid.
 */
export function isValidNationalId(id) {
  if (!id) return true
  return /^\d{10,12}$/.test(id.trim())
}

/**
 * Validate a phone number (starts with 0, 9-10 digits).
 */
export function isValidPhone(phone) {
  if (!phone) return true
  const cleaned = phone.replace(/[^\d]/g, '')
  return /^0\d{8,9}$/.test(cleaned)
}