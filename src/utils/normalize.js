// frontend/src/utils/normalize.js

/**
 * Normalises a list response from the API.
 * Some endpoints return an array directly, others nest it under a key.
 */
export function normalizeList(data, key) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data[key])) return data[key]
  return []
}

/**
 * Returns the full name of a patient object.
 */
export function fullName(patient) {
  if (!patient) return ''
  return [patient.first_name, patient.surname].filter(Boolean).join(' ')
}