// frontend/src/utils/normalize.js

/**
 * Returns the full name of a patient object.
 */
export function fullName(patient) {
  if (!patient) return ''
  return [patient.first_name, patient.surname].filter(Boolean).join(' ')
}