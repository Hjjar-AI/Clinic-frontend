<!-- frontend/src/components/layout/MainLayout.vue -->
<template>
  <div class="app-layout">
    <a
      href="#main-content"
      class="skip-link"
    >تخطي إلى المحتوى الرئيسي</a>

    <AppNavigation
      :collapsed="uiStore.sidebarCollapsed"
      :mobile-open="mobileOpen"
      @toggle="uiStore.toggleSidebar"
      @close-mobile="mobileOpen = false"
    />

    <div
      v-if="mobileOpen"
      class="sidebar-backdrop"
      @click="mobileOpen = false"
    />

    <div class="app-content">
      <header class="app-topbar">
        <div class="app-topbar__left">
          <BaseButton
            variant="ghost"
            class="sidebar-toggle"
            aria-label="تبديل القائمة"
            @click="uiStore.toggleSidebar"
          >
            <Icon icon="bars" />
          </BaseButton>
          <SearchInput
            v-if="authStore.can('view_patients')"
            variant="global"
            placeholder="بحث سريع..."
            :search-fn="globalSearch"
            :option-label="(p) => p.label"
            :option-key="(p) => p.id"
            min-length="2"
            :highlight="true"
            @select="goToItem"
          >
            <template #option="{ item }">
              <Icon :icon="item.icon" /> {{ item.label }}
            </template>
          </SearchInput>
        </div>
        <div class="app-topbar__right">
          <span
            v-if="refreshStore.lastUpdated"
            class="topbar-refresh"
          >
            <RelativeDate
              :date="refreshStore.lastUpdated"
              icon="sync"
            />
          </span>
          <NotificationCenter />
          <BaseButton
            variant="ghost"
            class="navbar__link"
            aria-label="تبديل الوضع الداكن"
            @click="uiStore.toggleDarkMode"
          >
            <Icon :icon="darkIcon" />
          </BaseButton>
          <router-link
            to="/change-password"
            class="navbar__link"
            title="تغيير كلمة المرور"
          >
            <Icon icon="key" />
          </router-link>
          <BaseButton
            variant="ghost"
            class="navbar__link"
            @click="logout"
          >
            <Icon icon="sign-out-alt" /> خروج
          </BaseButton>
        </div>
      </header>

      <main
        id="main-content"
        class="app-main"
        tabindex="-1"
      >
        <slot />
        <AppFooter />
      </main>

      <BottomNav v-if="isMobile" />
      <ScrollToTop />
    </div>
  </div>
</template>

<script setup>
// frontend/src/components/layout/MainLayout.vue
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import ScrollToTop from '@/components/common/ScrollToTop.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import RelativeDate from '@/components/ui/RelativeDate.vue';
import { useAppTheme } from '@/composables/useAppTheme';
import { useViewport } from '@/composables/useViewport';
import { useAuthStore } from '@/features/auth/stores/auth';
import NotificationCenter from '@/features/notifications/components/NotificationCenter.vue';
import patientService from '@/features/patients/services/patientService';
import { useSettingsStore } from '@/features/settings/stores/settings';
import { unwrapResponse } from '@/services/apiClient';
import { useRefreshStore } from '@/stores/refresh';
import { useUiStore } from '@/stores/ui';

import AppFooter from './AppFooter.vue';
import AppNavigation from './AppNavigation.vue';
import BottomNav from './BottomNav.vue';

const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();

const { isMobile } = useViewport();
const { darkIcon } = useAppTheme();

const refreshStore = useRefreshStore();
const settingsStore = useSettingsStore();
const mobileOpen = ref(false);

onMounted(() => {
  settingsStore.fetchSettings();
});

async function logout() {
  await authStore.logout();
  router.push({ name: 'Login' });
}

function patientLabel(patient) {
  return patient.full_name || [patient.first_name, patient.surname].filter(Boolean).join(' ');
}

const globalSearch = async (query) => {
  const result = await patientService.search({
    search: query,
    limit: 5,
  });

  const payload = unwrapResponse(result);
  const patients = payload?.patients || [];

  return patients.map((patient) => ({
    id: patient.id,
    label: patientLabel(patient),
    icon: 'user',
    url: `/patients/${patient.id}`,
  }));
};

function goToItem(item) {
  if (item?.url) {
    router.push(item.url);
  }
}
</script>

<style scoped>
/* FIX: rgba(0,0,0,0.35) → var(--color-bg-overlay) */
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--color-bg-overlay);
  z-index: var(--z-sidebar);
}
/* FIX: var(--breakpoint-md) → 768px */
@media (max-width: 768px) {
  .sidebar-backdrop {
    display: block;
  }
}
</style>
