export function announce(message) {
  if (window.__announce) {
    window.__announce(message)
  }
}