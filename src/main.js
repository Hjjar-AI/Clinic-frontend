// frontend/src/main.js
// Application CSS entry point owns the shared cascade order.
import '../public/static/css/app.css'
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