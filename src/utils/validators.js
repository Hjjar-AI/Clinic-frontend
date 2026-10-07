// frontend/src/utils/validators.js
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import {
  FOLLOW_UP_TYPE,
  GENDER_MALE,
  LEVEL_OF_CARE,
  MARITAL_STATUS_FEMALE,
  MARITAL_STATUS_MALE,
  SUICIDE_RISK_LEVELS,
  VIOLENCE_RISK_LEVELS,
} from '@/constants/statusConstants'

export function normalizePhone(phone) {
  if (!phone) return ''
  try {
    const parsed = parsePhoneNumberFromString(phone, 'SY')
    if (parsed && parsed.isValid()) {
      return parsed.number.toString()
    }
  } catch {
    // fallback to simple cleaning
  }
  let cleaned = phone.replace(/[^\d+]/g, '')
  if (!cleaned.startsWith('+')) cleaned = cleaned.replace(/^0+/, '0')
  return cleaned
}

export function validatePhone(value, { minLength = 9, maxLength = 10 } = {}) {
  if (!value) return true
  try {
    const parsed = parsePhoneNumberFromString(value, 'SY')
    if (parsed && parsed.isValid()) {
      const national = parsed.nationalNumber
      return national.length >= minLength && national.length <= maxLength
    }
  } catch {
    // fallback
    const normalised = normalizePhone(value)
    if (normalised.length < minLength || normalised.length > maxLength) return false
    return /^0\d+$/.test(normalised)
  }
  return false
}

export function validateNationalId(value, { minLength = 10, maxLength = 12 } = {}) {
  if (!value) return true
  const trimmed = value.trim()
  if (trimmed.length < minLength || trimmed.length > maxLength) return false
  return /^\d+$/.test(trimmed)
}

export function validateYear(year, minYear = 1900, maxYear = new Date().getFullYear()) {
  try {
    const y = parseInt(year, 10)
    return minYear <= y && y <= maxYear
  } catch {
    return false
  }
}

export function validateMaritalStatus(status, gender) {
  if (!status) return true
  const allowed = gender === GENDER_MALE ? MARITAL_STATUS_MALE : MARITAL_STATUS_FEMALE
  return allowed.includes(status)
}

export function validateSuicideRisk(level) {
  if (!level) return true
  return SUICIDE_RISK_LEVELS.includes(level)
}

export function validateViolenceRisk(level) {
  if (!level) return true
  return VIOLENCE_RISK_LEVELS.includes(level)
}

export function validateLevelOfCare(level) {
  if (!level) return true
  return LEVEL_OF_CARE.includes(level)
}

export function validateFollowUpType(type) {
  if (!type) return true
  return FOLLOW_UP_TYPE.includes(type)
}

export function validateSupervisorId(supervisorId) {
  if (supervisorId === null || supervisorId === undefined || supervisorId === '') return true
  return Number.isInteger(Number(supervisorId)) && Number(supervisorId) > 0
}

// Common passwords list (subset; can be expanded)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'admin', 'letmein',
  'welcome', 'monkey', 'dragon', 'master', 'login', 'hello', 'freedom',
  'whatever', 'trustno1', 'starwars', 'iloveyou', 'batman', 'superman'
]

// Minimum password length. Keep in sync with:
//   - backend/config/settings/base.py  (MinimumLengthValidator.OPTIONS.min_length)
//   - backend/apps/accounts/serializers.py (ChangePasswordSerializer min_length)
//   - backend/apps/accounts/serializers.py (UserSerializer min_length)
const MIN_PASSWORD_LENGTH = 8

/**
 * Aligns with Django's password validators:
 * - Minimum length (8)
 * - Not entirely numeric
 * - Not similar to username (if provided)
 * - Not a common password
 */
export function isPasswordStrong(password, username = '') {
  if (!password || password.length < MIN_PASSWORD_LENGTH) return false
  if (/^\d+$/.test(password)) return false
  if (username && password.toLowerCase().includes(username.toLowerCase())) return false
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) return false
  return true
}

/**
 * Returns a strength score (0-4) and label for UI.
 * Mirrors backend validation rules more closely than zxcvbn.
 */
export function getPasswordStrength(password, username = '') {
  if (!password) {
    return { score: 0, label: 'ضعيفة', percent: 0 }
  }

  let score = 0
  const checks = {
    length: password.length >= MIN_PASSWORD_LENGTH,
    notNumeric: !/^\d+$/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
    notSimilarToUsername: !username || !password.toLowerCase().includes(username.toLowerCase()),
    hasMixedChars: /[a-zA-Z]/.test(password) && /\d/.test(password),
  }

  if (checks.length) score++
  if (checks.notNumeric) score++
  if (checks.notCommon) score++
  if (checks.notSimilarToUsername) score++
  if (checks.hasMixedChars) score++

  // Cap at 4
  score = Math.min(score, 4)

  const label = score <= 1 ? 'ضعيفة' : score <= 3 ? 'متوسطة' : 'قوية'
  const percent = (score / 4) * 100
  return { score, label, percent }
}
