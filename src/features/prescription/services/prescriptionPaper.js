export const defaultPaperOptions = () => ({ mode: 'blank', width_mm: 105, height_mm: 148, offset_x_mm: 0, offset_y_mm: 0 })
export const paperPresets = [{ value: 'a6', label: 'A6 · 105 × 148 مم' }, { value: 'a4', label: 'A4 · 210 × 297 مم' }, { value: 'custom', label: 'أبعاد مخصصة' }]
export function normalizePaperOptions(options) {
  if (!['blank', 'preprinted'].includes(options?.mode)) return null
  const result = { mode: options.mode }
  for (const [key, min, max] of [['width_mm', 80, 216], ['height_mm', 120, 350], ['offset_x_mm', -5, 5], ['offset_y_mm', -5, 5]]) {
    const raw = options[key]
    if (!['number', 'string'].includes(typeof raw) || String(raw).trim() === '') return null
    const value = Number(raw)
    if (!Number.isFinite(value) || value < min || value > max || Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) return null
    result[key] = options.mode === 'blank' && key.startsWith('offset_') ? 0 : value
  }
  return result
}

const preferenceKey = userId => {
  const id = Number(userId)
  return Number.isSafeInteger(id) && id > 0 ? `clinic:prescription-paper:${id}` : null
}
export function loadPaperOptions(userId) {
  try {
    const key = preferenceKey(userId)
    return (key && normalizePaperOptions(JSON.parse(localStorage.getItem(key)))) || defaultPaperOptions()
  } catch { return defaultPaperOptions() }
}
export function rememberPaperOptions(userId, options) {
  const key = preferenceKey(userId)
  const paper = normalizePaperOptions(options)
  if (!key || !paper) return false
  try { localStorage.setItem(key, JSON.stringify(paper)); return true } catch { return false }
}
export const paperPreset = paper => paper.width_mm === 105 && paper.height_mm === 148 ? 'a6' : paper.width_mm === 210 && paper.height_mm === 297 ? 'a4' : 'custom'
