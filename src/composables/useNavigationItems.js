import { computed, onBeforeUnmount, onMounted } from 'vue';

import { useAuthStore } from '@/features/auth/stores/auth';
import { useAnalyticsStore } from '@/features/dashboard/stores/analytics';

const BADGE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
let navigationConsumers = 0;
let badgeInterval = null;

export function useNavigationItems() {
  const authStore = useAuthStore();
  const analyticsStore = useAnalyticsStore();
  const isAdmin = computed(() => authStore.can('manage_users'));
  const appointmentsBadge = computed(() => analyticsStore.dashboard.appointments_today || 0);

  const mainItems = [
    { to: { name: 'Dashboard' }, icon: 'tachometer-alt', label: 'الرئيسية' },
    { to: { name: 'PatientsList' }, icon: 'users', label: 'المرضى', permission: 'view_patients' },
    { to: { name: 'VisitsList' }, icon: 'file-medical', label: 'الزيارات', permission: 'view_visits' },
    { to: { name: 'AppointmentsCalendar' }, icon: 'calendar-alt', label: 'المواعيد', permission: 'view_appointments' },
    { to: { name: 'Tasks' }, icon: 'tasks', label: 'المهام', permission: 'manage_tasks' },
    { to: { name: 'InvoicesList' }, icon: 'file-invoice', label: 'الفواتير', permission: 'view_billing' },
    { to: { name: 'Statistics' }, icon: 'chart-line', label: 'التقارير', permission: 'view_reports' },
  ];

  const adminItems = [
    { to: { name: 'Users' }, icon: 'user-cog', label: 'المستخدمين', permission: 'manage_users' },
    { to: { name: 'DiagnosesManage' }, icon: 'diagnoses', label: 'التشخيصات', permission: 'manage_options' },
    { to: { name: 'MedicationsManage' }, icon: 'pills', label: 'الأدوية', permission: 'manage_options' },
    { to: { name: 'ScalesAdmin' }, icon: 'chart-line', label: 'المقاييس', permission: 'manage_options' },
    { to: { name: 'Templates' }, icon: 'copy', label: 'القوالب', permission: 'manage_templates' },
    { to: { name: 'Settings' }, icon: 'cog', label: 'الإعدادات', permission: 'manage_settings' },
    { to: { name: 'BackupView' }, icon: 'shield-alt', label: 'النسخ الاحتياطي', permission: 'manage_backup' },
    { to: { name: 'ImportData' }, icon: 'upload', label: 'استيراد', permission: 'import_data' },
  ];

  const allItems = computed(() => {
    const itemsWithBadges = mainItems.map((item) =>
      item.to.name === 'AppointmentsCalendar' ? { ...item, badge: appointmentsBadge.value } : item
    );

    return [...itemsWithBadges, ...adminItems].filter(
      item => !item.permission || authStore.can(item.permission)
    );
  });

  async function refreshBadges() {
    await analyticsStore.fetchDashboard();
  }

  onMounted(() => {
    navigationConsumers += 1;
    if (navigationConsumers === 1) {
      refreshBadges();
      badgeInterval = setInterval(refreshBadges, BADGE_REFRESH_INTERVAL_MS);
    }
  });

  onBeforeUnmount(() => {
    navigationConsumers = Math.max(0, navigationConsumers - 1);
    if (navigationConsumers === 0 && badgeInterval) {
      clearInterval(badgeInterval);
      badgeInterval = null;
    }
  });

  return { allItems, isAdmin, appointmentsBadge, refreshBadges };
}
