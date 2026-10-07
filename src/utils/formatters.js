// frontend/src/utils/formatters.js
// Pure formatting functions – no Vue imports, no side effects.

export function toArabicNumerals(value) {
  if (value == null) return ''
  return String(value).replace(/[0-9]/g, d =>
    String.fromCharCode(0x0660 + d.charCodeAt(0) - 48)
  )
}

export function formatNumber(value, options = {}) {
  if (value == null || value === '') return ''
  const num = Number(value)
  if (isNaN(num)) return String(value)
  try {
    return new Intl.NumberFormat('ar-SA', {
      maximumFractionDigits: options.fractionDigits ?? 2,
      ...options,
    }).format(num)
  } catch {
    return toArabicNumerals(String(num))
  }
}

export function formatMoney(amount, currency = 'ر.س') {
  if (amount == null) return '—'
  const num = Number(amount)
  if (isNaN(num)) return String(amount)
  return `${formatNumber(num, { maximumFractionDigits: 2 })} ${currency}`
}

export function formatPhone(phone) {
  if (!phone) return '—'
  const cleaned = phone.replace(/[^\d]/g, '')
  if (cleaned.length === 10) {
    return toArabicNumerals(cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'))
  }
  return toArabicNumerals(phone)
}

export function formatNationalId(id) {
  if (!id) return '—'
  const cleaned = id.replace(/[^\d]/g, '')
  if (cleaned.length === 10) {
    return toArabicNumerals(cleaned.replace(/(\d)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4'))
  }
  if (cleaned.length === 12) {
    return toArabicNumerals(cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4'))
  }
  return toArabicNumerals(cleaned)
}