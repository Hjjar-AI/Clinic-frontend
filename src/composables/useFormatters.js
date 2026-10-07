// frontend/src/composables/useFormatters.js
// Thin composable that re‑exports pure formatting functions from the utility layer.

import {
  formatMoney,
  formatNationalId,
  formatNumber,
  formatPhone,
  toArabicNumerals,
} from '@/utils/formatters'

export function useFormatters() {
  return {
    toArabicNumerals,
    formatNumber,
    formatMoney,
    formatPhone,
    formatNationalId,
  }
}