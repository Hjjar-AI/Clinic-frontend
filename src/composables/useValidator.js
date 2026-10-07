// frontend/src/composables/useValidator.js
import { useSystemConfig } from '@/composables/useSystemConfig'
import {
  validateNationalId as pureValidateNationalId,
  validatePhone as pureValidatePhone,
} from '@/utils/validators'

export function useValidator() {
  const { config } = useSystemConfig()

  function validatePhone(value) {
    const cfg = config.value || {}
    return pureValidatePhone(value, {
      minLength: cfg.phone_min_length ?? 9,
      maxLength: cfg.phone_max_length ?? 10,
    })
  }

  function validateNationalId(value) {
    const cfg = config.value || {}
    return pureValidateNationalId(value, {
      minLength: cfg.national_id_min_length ?? 10,
      maxLength: cfg.national_id_max_length ?? 12,
    })
  }

  return { validatePhone, validateNationalId }
}