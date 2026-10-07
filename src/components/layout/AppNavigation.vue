<template>
  <aside
    class="app-sidebar"
    :class="{ collapsed: collapsed, 'mobile-open': mobileOpen }"
  >
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

    <div class="sidebar-footer">
      <BaseButton
        class="sidebar-link sidebar-collapse-btn"
        :aria-label="collapsed ? 'توسيع القائمة' : 'طي القائمة'"
        @click="$emit('toggle')"
      >
        <Icon
          icon="chevron-right"
          :style="{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }"
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
