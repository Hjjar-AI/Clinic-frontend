// frontend/src/composables/useScrollTo.js
/**
 * Provides a smooth‑scroll helper to any element or position.
 */
export function useScrollTo() {
  function scrollTo(target, options = {}) {
    let element = null
    if (typeof target === 'string') {
      element = document.querySelector(target)
    } else if (target instanceof HTMLElement) {
      element = target
    }
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: options.block || 'start',
        inline: options.inline || 'nearest',
      })
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' })
    }
  }

  return { scrollTo }
}