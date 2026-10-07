<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.to.name"
      :to="item.to"
      class="bottom-nav__item"
      active-class="bottom-nav__item--active"
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
</template>

<script setup>
import { computed } from 'vue';

import Badge from '@/components/ui/Badge.vue';
import Icon from '@/components/ui/Icon.vue';
import { useNavigationItems } from '@/composables/useNavigationItems';

const { allItems } = useNavigationItems();
const preferredRoutes = ['Dashboard', 'PatientsList', 'VisitsList', 'AppointmentsCalendar', 'Tasks'];
const navItems = computed(() =>
  preferredRoutes
    .map(name => allItems.value.find(item => item.to.name === name))
    .filter(Boolean)
    .slice(0, 5)
);
</script>
