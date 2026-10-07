/** Save a Blob response and always release the temporary object URL. */
export function downloadBlob(responseOrBlob, filename) {
  const value = responseOrBlob?.data ?? responseOrBlob
  const blob = value instanceof Blob ? value : new Blob([value])
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}
