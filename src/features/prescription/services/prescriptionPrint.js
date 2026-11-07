export function preparePrintWindow() {
  try {
    const popup = window.open('about:blank', '_blank')
    if (!popup) return null
    popup.opener = null
    popup.document.title = 'تحميل الوصفة المحفوظة'
    popup.document.body.textContent = 'جاري تحميل الوصفة المحفوظة…'
    return popup
  } catch { return null }
}

export function printSavedPdf(url, popup) {
  if (!popup || popup.closed) return false
  try {
    const loaded = () => {
      try {
        if (popup.location.href !== url) return
        popup.removeEventListener('load', loaded)
        popup.focus(); popup.print()
      } catch { popup.removeEventListener('load', loaded) /* Native PDF controls remain available. */ }
    }
    popup.addEventListener('load', loaded)
    popup.location.replace(url)
    return true
  } catch { popup.close(); return false }
}
