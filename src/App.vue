<!-- frontend/src/App.vue -->
<template>
  <ErrorBoundary>
    <MainLayout v-if="authStore.isAuthenticated">
      <MaintenanceBanner />
      <router-view v-slot="{ Component, route }">
        <transition
          name="page-fade"
          mode="out-in"
        >
          <component
            :is="Component"
            :key="route.path"
          />
        </transition>
      </router-view>
    </MainLayout>
    <main
      v-else
      class="app-content app-content--full"
    >
      <router-view v-slot="{ Component, route }">
        <transition
          name="page-fade"
          mode="out-in"
        >
          <component
            :is="Component"
            :key="route.path"
          />
        </transition>
      </router-view>
    </main>
  </ErrorBoundary>

  <ConfirmDialog
    v-if="confirmStore.active"
    :key="confirmStore.active.id"
    :model-value="!!confirmStore.active"
    :title="confirmStore.active.options.title"
    :confirm-text="confirmStore.active.options.confirmText"
    :cancel-text="confirmStore.active.options.cancelText"
    :header-variant="confirmStore.active.options.headerVariant"
    :require-checkbox="confirmStore.active.options.requireCheckbox"
    :checkbox-label="confirmStore.active.options.checkboxLabel"
    :input="confirmStore.active.options.input"
    @confirm="confirmStore.onConfirm($event)"
    @cancel="confirmStore.onCancel()"
  >
    <p>{{ confirmStore.active.message }}</p>
  </ConfirmDialog>

  <CriticalOverlay
    v-if="isBlurred || showTimeoutWarning"
    :visible="isBlurred || showTimeoutWarning"
    :type="showTimeoutWarning ? 'timeout' : 'phi'"
    :title="showTimeoutWarning ? 'جلستك على وشك الانتهاء' : 'تم إخفاء الشاشة لحماية خصوصية المريض'"
    :message="!showTimeoutWarning ? 'انقر للعودة إلى العرض' : ''"
    :seconds-remaining="secondsRemaining"
    @dismiss="dismissBlur"
    @stay="dismissWarning"
    @logout="handleTimeoutLogout"
  />

  <LoadingOverlay :model-value="loadingStore.isLoading" />
  <AppStatusBar />
  <RouteProgressBar />
  <BaseToast />
  <ShortcutsModal v-model="showShortcuts" />
</template>

<script setup>
import { defineAsyncComponent,onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppStatusBar from '@/components/common/AppStatusBar.vue'
import CriticalOverlay from '@/components/common/CriticalOverlay.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import MaintenanceBanner from '@/components/common/MaintenanceBanner.vue'
import RouteProgressBar from '@/components/common/RouteProgressBar.vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import BaseToast from '@/components/ui/BaseToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import { useSession } from '@/composables/useSession'
import { useShortcut } from '@/composables/useShortcut'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useUserStore } from '@/features/settings/stores/users'
import { useConfirmStore } from '@/stores/confirm'
import { useLoadingStore } from '@/stores/loading'

const ShortcutsModal = defineAsyncComponent(() => import('@/components/common/ShortcutsModal.vue'))

const loadingStore = useLoadingStore()
const confirmStore = useConfirmStore()
const { isBlurred, showTimeoutWarning, secondsRemaining, dismissWarning } = useSession(30)
const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

const showShortcuts = ref(false)

// Global shortcuts
useShortcut({ key: 'k', alt: true, handler: () => { showShortcuts.value = !showShortcuts.value } })
useShortcut({ key: 'd', alt: true, handler: () => router.push({ name: 'Dashboard' }) })
useShortcut({ key: 'p', alt: true, handler: () => navigateIfAllowed('view_patients', 'PatientsList') })
useShortcut({ key: 'n', alt: true, handler: () => navigateIfAllowed('edit_patient', 'PatientCreate') })
useShortcut({ key: 'c', alt: true, handler: () => navigateIfAllowed('view_appointments', 'AppointmentsCalendar') })
useShortcut({ key: 'a', alt: true, handler: () => navigateIfAllowed('manage_appointments', 'AppointmentCreate') })
useShortcut({ key: 't', alt: true, handler: () => navigateIfAllowed('manage_tasks', 'Tasks') })
useShortcut({ key: 'r', alt: true, handler: () => navigateIfAllowed('view_reports', 'Statistics') })
useShortcut({ key: 's', alt: true, handler: () => navigateIfAllowed('manage_settings', 'Settings') })

// Ctrl+S – save any visible form
useShortcut({ key: 's', ctrl: true, handler: () => {
  const submitBtn = document.querySelector('form button[type="submit"]')
  if (submitBtn) submitBtn.click()
}})

// Ctrl+F – focus global search
useShortcut({ key: 'f', ctrl: true, handler: () => {
  const searchInput = document.querySelector('.navbar__search-input')
  if (searchInput) searchInput.focus()
}})

onMounted(() => {
  if (authStore.isAuthenticated) {
    userStore.fetchDoctors()
  }
})

function dismissBlur() { isBlurred.value = false }
async function handleTimeoutLogout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
function navigateIfAllowed(permission, routeName) {
  if (authStore.can(permission)) router.push({ name: routeName })
}
</script>
