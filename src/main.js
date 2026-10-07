// frontend/src/main.js
// ---------- CSS (bundled by Vite, order preserves cascade) ----------
// Tokens (split into 5 files)
import '../public/static/css/tokens_colors.css'
import '../public/static/css/tokens_components.css'
import '../public/static/css/tokens_motion.css'
import '../public/static/css/tokens_spacing.css'
import '../public/static/css/tokens_typography.css'
import '../public/static/css/tokens_breakpoints.css'
import '../public/static/css/state.css'
import '../public/static/css/themes.css'
import '../public/static/css/reset.css'
import '../public/static/css/typography.css'
import '../public/static/css/layout.css'
import '../public/static/css/buttons.css'
// Forms (split into base + advanced)
import '../public/static/css/forms_base.css'
import '../public/static/css/forms_advanced.css'
import '../public/static/css/cards.css'
import '../public/static/css/tables.css'
import '../public/static/css/tags.css'
import '../public/static/css/notifications.css'
import '../public/static/css/navigation.css'
// Calendar (split into 4 view files)
import '../public/static/css/calendar_common.css'
import '../public/static/css/calendar_day.css'
import '../public/static/css/calendar_week.css'
import '../public/static/css/calendar_month.css'
// Components (split into 6 functional files)
import '../public/static/css/components_accordion.css'
import '../public/static/css/components_avatar.css'
import '../public/static/css/components_modal.css'
import '../public/static/css/components_overlay.css'
import '../public/static/css/components_tabs.css'
import '../public/static/css/components_misc.css'
import '../public/static/css/utilities.css'
import '../public/static/css/splash.css'
import '../public/static/css/animations.css'
import '../public/static/css/pdf_styles.css'
import '../public/static/css/transitions.css'
import '../public/static/css/filters.css'
import '../public/static/css/clinical.css'
import '../public/static/css/charts.css'
import '../public/static/css/patients.css'
import '../public/static/css/visits.css'
// Third‑party libraries (keep as is)
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'flatpickr/dist/flatpickr.min.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { initializeApp } from '@/bootstrap'
import { registerApiHandlers } from '@/bootstrap/registerApiHandlers'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Icon from '@/components/ui/Icon.vue'
import { useSystemConfig } from '@/composables/useSystemConfig'
import { APP_CONFIG } from '@/config/app'
import { useConstantsStore } from '@/stores/constants'
import { persistPlugin } from '@/stores/plugins/persist'

import App from './App.vue'
import autofocus from './directives/autofocus'
import autoTitle from './directives/autoTitle'
import clipboard from './directives/clipboard'
import debounce from './directives/debounce'
import router from './router'

async function mount() {
  try {
    await initializeApp()
  } catch (error) {
    if (APP_CONFIG.isDevelopment) {
      console.error('[Bootstrap] Initialisation failed:', error)
    }
  }

  const app = createApp(App)
  const pinia = createPinia()
  pinia.use(persistPlugin)

  // Vue Query
  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          staleTime: 1000 * 60 * 5, // 5 minutes
        },
      },
    },
  })

  app.directive('autofocus', autofocus)
  app.directive('auto-title', autoTitle)
  app.directive('debounce', debounce)
  app.directive('clipboard', clipboard)

  // Register global components
  app.component('Icon', Icon)
  app.component('BaseButton', BaseButton)
  app.component('BaseCard', BaseCard)

  app.use(pinia)
  app.use(router)

  // Register API event handlers AFTER pinia and router are installed,
  // because the handlers call useAuthStore / useConfirmStore / router.
  // Doing this in `main.js` (not in apiClient) keeps the HTTP layer free
  // of store/router imports — see `@/services/apiEvents`.
  registerApiHandlers()

  // Global error handler
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Global Error Handler]', err, info)
  }

  await router.isReady()

  // Load constants in the background (non-blocking)
  const constantsStore = useConstantsStore()
  constantsStore.fetch().catch((err) => {
    if (APP_CONFIG.isDevelopment) console.warn('Failed to load clinical constants', err)
  })

  // Fetch system config (non-blocking)
  const { fetchConfig } = useSystemConfig()
  fetchConfig().catch(() => {})

  app.mount('#app')
}

mount()