// frontend/src/bootstrap/index.js
import { themeService } from '@/services/themeService';
export async function initializeApp() {
  // 1. Load preferences (with migration of old keys)
  const prefs = themeService.load();

  // 2. Keep the body classes used by the theme styles in sync.
  themeService.apply(prefs.theme, prefs.darkMode);

  // 3. Optionally pre-fetch system config for later use
  //    (lazy‑loaded by useSystemConfig, so we skip for now)

  // If any error occurs, it will be caught by the caller (main.js) and handled gracefully.
  return prefs;
}
