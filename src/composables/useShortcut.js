// frontend/src/composables/useShortcut.js
import { useMagicKeys, whenever } from '@vueuse/core'
import { onBeforeUnmount } from 'vue'

/**
 * Registers a global keyboard shortcut using VueUse's useMagicKeys.
 *
 * @param {Object}   config
 * @param {string}   config.key      - KeyboardEvent.key (e.g., 'k', 'Escape')
 * @param {boolean}  [config.ctrl]   - require Ctrl
 * @param {boolean}  [config.alt]    - require Alt
 * @param {Function} config.handler  - callback
 */
export function useShortcut({ key, ctrl = false, alt = false, handler }) {
  const keys = useMagicKeys()

  // Build the shortcut string (e.g., 'Control+k' or 'Alt+k')
  let shortcut = key.toLowerCase()
  if (ctrl) shortcut = `Control+${shortcut}`
  if (alt) shortcut = `Alt+${shortcut}`

  // VueUse's whenever will handle the listener
  const stop = whenever(keys[shortcut], handler)

  onBeforeUnmount(() => {
    stop()
  })
}
