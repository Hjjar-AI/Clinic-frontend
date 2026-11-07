<!-- frontend/src/components/layout/AppFooter.vue -->
<template>
  <footer class="footer">
    <div class="footer__legal">
      <router-link :to="{ name: 'PrivacyPolicy' }">
        سياسة الخصوصية
      </router-link>
      <router-link :to="{ name: 'TermsOfService' }">
        شروط الخدمة
      </router-link>
      <router-link :to="{ name: 'Manual' }">
        الدليل
      </router-link>
      <router-link :to="{ name: 'About' }">
        حول النظام
      </router-link>
    </div>
    <div class="footer__info">
      <span>{{ clinicName }} © 2026</span>
      <span class="footer__version">v2.0.0</span>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

import { useSettingsStore } from '@/features/settings/stores/settings';

const settingsStore = useSettingsStore();

const clinicName = computed(() => settingsStore.settings.clinic_name || 'عيادة الإتزان');
</script>
