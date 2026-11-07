// frontend/src/composables/useDate.js
import { addDays, addMonths,addWeeks, differenceInDays, format, isValid } from 'date-fns'
import { arSA } from 'date-fns/locale'

import { calculateAge as computeAge } from '@/utils/businessRules'

let ArabicLocale = null
let flatpickrReady = null

export function useDate() {
  function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null
    const trimmed = dateStr.trim()
    // Handle ISO datetime strings like "2026-09-05T10:00:00Z"
    const isoDateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/.exec(trimmed)
    if (isoDateTimeMatch) {
      if (!parseDate(trimmed.slice(0, 10))) return null
      const date = new Date(trimmed)
      return isValid(date) ? date : null
    }
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
    if (isoMatch) {
      const date = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]))
      return isValid(date) && date.getFullYear() === Number(isoMatch[1]) && date.getMonth() === Number(isoMatch[2]) - 1 && date.getDate() === Number(isoMatch[3]) ? date : null
    }
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) return null
    const parts = trimmed.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      const date = new Date(year, month, day)
      if (isValid(date) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date
      }
    }
    return null
  }

  function toISODate(dateObj) {
    if (!dateObj || !isValid(dateObj)) return ''
    return format(dateObj, 'yyyy-MM-dd')
  }

  function formatDate(dateObj) {
    if (!dateObj) return ''
    let d
    if (dateObj instanceof Date) {
      d = dateObj
    } else if (typeof dateObj === 'string') {
      d = parseDate(dateObj)
      if (!d) return ''
    } else {
      return ''
    }
    try {
      return format(d, 'dd/MM/yyyy', { locale: arSA })
    } catch {
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }
  }

  function today() {
    return new Date()
  }

  function addDaysFn(date, days) {
    return addDays(date, days)
  }

  function addWeeksFn(date, weeks) {
    return addWeeks(date, weeks)
  }

  function addMonthsFn(date, months) {
    return addMonths(date, months)
  }

  function calculateAge(dobYear, visitDateObj) {
    return computeAge(dobYear, visitDateObj)
  }

  function userFriendlyDate(dateInput) {
    if (!dateInput) return ''
    const date = dateInput instanceof Date ? dateInput : parseDate(dateInput)
    if (!isValid(date)) return ''
    const now = new Date()
    const diffDays = differenceInDays(now, date)
    if (diffDays === 0) return 'اليوم'
    if (diffDays === 1) return 'أمس'
    if (diffDays < 0) return `بعد ${Math.abs(diffDays)} أيام`
    if (diffDays < 7) return `منذ ${diffDays} أيام`
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`
    return formatDate(date)
  }

  function timeAgo(dateInput) {
    if (!dateInput) return ''
    const date = dateInput instanceof Date ? dateInput : parseDate(dateInput)
    if (!isValid(date)) return ''
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 0) return userFriendlyDate(date)
    if (seconds < 60) return 'الآن'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `منذ ${hours} ساعة`
    return userFriendlyDate(date)
  }

  function normalizeDate(value) {
    if (!value) return ''
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value
    const parsed = parseDate(value) || (value instanceof Date ? value : new Date(value))
    return formatDate(parsed)
  }

  function normalizeFormDates(payload, dateFields) {
    const result = { ...payload }
    for (const key of dateFields) {
      if (result[key]) {
        const d = parseDate(result[key])
        if (!d) throw new Error('تاريخ غير صالح؛ استخدم يوم/شهر/سنة')
        result[key] = toISODate(d)
      } else if (result[key] === '') {
        // DRF nullable DateFields accept JSON null, not an empty string.
        // Required date fields still fail backend/frontend validation cleanly.
        result[key] = null
      }
    }
    return result
  }

  async function loadFlatpickr() {
    if (!flatpickrReady) flatpickrReady = Promise.all([
      import('flatpickr'), import('flatpickr/dist/l10n/ar.js')
    ]).then(([module, locale]) => {
      ArabicLocale = locale.Arabic || locale.default?.Arabic || locale.default?.ar || locale.default?.default?.ar
      return module
    }).catch(() => { flatpickrReady = null; return null })
    return flatpickrReady
  }

  function getFlatpickrDefaults(overrides = {}) {
    const locale = ArabicLocale || 'default'
    return {
      dateFormat: 'd/m/Y',
      disableMobile: true,
      allowInput: true,
      locale: locale,
      ...overrides,
    }
  }

  async function initDatePicker(element, options = {}) {
    const flatpickr = await loadFlatpickr()
    if (!flatpickr) return null
    const defaults = getFlatpickrDefaults({ ...options, locale: options.locale === 'default' ? ArabicLocale : options.locale || ArabicLocale })
    return flatpickr.default(element, defaults)
  }

  return {
    parseDate,
    toISODate,
    formatDate,
    today,
    addDays: addDaysFn,
    addWeeks: addWeeksFn,
    addMonths: addMonthsFn,
    calculateAge,
    userFriendlyDate,
    timeAgo,
    normalizeDate,
    normalizeFormDates,
    loadFlatpickr,
    initDatePicker,
    getFlatpickrDefaults,
  }
}
