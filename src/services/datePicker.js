let ArabicLocale = null
let flatpickrReady = null

export async function loadFlatpickr() {
  if (!flatpickrReady)
    flatpickrReady = Promise.all([
      import('flatpickr'),
      import('flatpickr/dist/l10n/ar.js'),
    ])
      .then(([module, locale]) => {
        ArabicLocale =
          locale.Arabic ||
          locale.default?.Arabic ||
          locale.default?.ar ||
          locale.default?.default?.ar
        return module
      })
      .catch(() => {
        flatpickrReady = null
        return null
      })
  return flatpickrReady
}

export function getFlatpickrDefaults(overrides = {}) {
  const locale = ArabicLocale || 'default'
  return {
    dateFormat: 'd/m/Y',
    disableMobile: true,
    allowInput: true,
    locale: locale,
    ...overrides,
  }
}

export async function initDatePicker(element, options = {}) {
  const flatpickr = await loadFlatpickr()
  if (!flatpickr) return null
  const defaults = getFlatpickrDefaults({
    ...options,
    locale:
      options.locale === 'default'
        ? ArabicLocale
        : options.locale || ArabicLocale,
  })
  return flatpickr.default(element, defaults)
}
