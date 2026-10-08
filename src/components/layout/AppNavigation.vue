<template>
  <aside
    id="app-navigation"
    aria-label="القائمة الرئيسية"
    class="app-sidebar"
    :class="{ collapsed: collapsed, 'mobile-open': mobileOpen }"
  >
    <BaseButton v-if="mobileOpen" variant="ghost" class="sidebar-mobile-close" aria-label="إغلاق القائمة" @click="$emit('close-mobile')">
      <Icon icon="xmark" /> إغلاق
    </BaseButton>
    <router-link
      :to="{ name: 'Dashboard' }"
      class="sidebar-brand"
      @click="$emit('close-mobile')"
    >
      <Icon icon="stethoscope" />
      <span>{{ clinicName }}</span>
    </router-link>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to.name"
        :to="item.to"
        :aria-label="item.label"
        :title="collapsed ? item.label : undefined"
        class="sidebar-link"
        active-class="router-link-active"
        @click="$emit('close-mobile')"
      >
        <Icon :icon="item.icon" />
        <span>{{ item.label }}</span>
        <Badge
          v-if="item.badge"
          :value="item.badge"
          severity="danger"
          size="xs"
          variant="soft"
        />
      </router-link>
    </nav>

    <div v-if="!mobileOpen" class="sidebar-footer">
      <BaseButton
        class="sidebar-link sidebar-collapse-btn"
        :aria-label="collapsed ? 'توسيع القائمة' : 'طي القائمة'"
        @click="$emit('toggle')"
      >
        <Icon
          icon="chevron-right"
          class="sidebar-collapse-icon"
        />
        <span>طي القائمة</span>
      </BaseButton>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';

import Badge from '@/components/ui/Badge.vue';
import Icon from '@/components/ui/Icon.vue';
import { useNavigationItems } from '@/composables/useNavigationItems';
import { useSettingsStore } from '@/features/settings/stores/settings';

defineProps({ collapsed: Boolean, mobileOpen: Boolean });
defineEmits(['toggle', 'close-mobile']);

const settingsStore = useSettingsStore();
const { allItems: navItems } = useNavigationItems();

const clinicName = computed(() => settingsStore.settings.clinic_name || 'عيادة الإتزان');
</script>
