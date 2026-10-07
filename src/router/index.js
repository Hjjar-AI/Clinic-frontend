// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import { cancelAllPending } from '@/services/apiClient'

import { authGuard, fetchMeGuard,permissionGuard } from './guards'

const routes = [
  {
    path: '/login', name: 'Login',
    component: () => import('@/features/auth/views/Login.vue'),
    meta: { guestOnly: true, title: 'تسجيل الدخول', breadcrumb: [{ label: 'تسجيل الدخول' }] }
  },
  {
    path: '/dashboard', name: 'Dashboard',
    component: () => import('@/features/dashboard/views/Dashboard.vue'),
    meta: { requiresAuth: true, title: 'لوحة التحكم', breadcrumb: [{ label: 'لوحة التحكم', to: { name: 'Dashboard' } }] }
  },
  {
    path: '/patients', name: 'PatientsList',
    component: () => import('@/features/patients/views/PatientsList.vue'),
    meta: { requiresAuth: true, title: 'المرضى', permission: 'view_patients', breadcrumb: [{ label: 'المرضى', to: { name: 'PatientsList' } }] }
  },
  {
    path: '/patients/new', name: 'PatientCreate',
    component: () => import('@/features/patients/views/PatientForm.vue'),
    meta: { requiresAuth: true, title: 'مريض جديد', permission: 'edit_patient', breadcrumb: [{ label: 'المرضى', to: { name: 'PatientsList' } }, { label: 'مريض جديد' }] }
  },
  {
    path: '/patients/:id', name: 'PatientDetail',
    component: () => import('@/features/patients/views/PatientDetail.vue'),
    meta: { requiresAuth: true, title: 'ملف المريض', permission: 'view_patients' }
  },
  {
    path: '/patients/:id/edit', name: 'PatientEdit',
    component: () => import('@/features/patients/views/PatientForm.vue'),
    meta: { requiresAuth: true, title: 'تعديل مريض', permission: 'edit_patient' }
  },
  {
    path: '/patients/:patientId/visits/new', name: 'VisitCreate',
    component: () => import('@/features/visits/views/VisitForm.vue'),
    meta: { requiresAuth: true, title: 'زيارة جديدة', permission: 'add_visit' }
  },
  {
    path: '/visits/:id', name: 'VisitDetail',
    component: () => import('@/features/visits/views/VisitDetail.vue'),
    meta: { requiresAuth: true, title: 'تفاصيل الزيارة', permission: 'view_visits' }
  },
  {
    path: '/visits/:id/edit', name: 'VisitEdit',
    component: () => import('@/features/visits/views/VisitForm.vue'),
    meta: { requiresAuth: true, title: 'تعديل زيارة', permission: 'edit_visit' }
  },
  {
    path: '/visits', name: 'VisitsList',
    component: () => import('@/features/visits/views/VisitsList.vue'),
    meta: { requiresAuth: true, title: 'الزيارات', permission: 'view_visits' }
  },
  {
    path: '/appointments', name: 'AppointmentsCalendar',
    component: () => import('@/features/appointments/views/AppointmentsCalendar.vue'),
    meta: { requiresAuth: true, title: 'المواعيد', permission: 'view_appointments', breadcrumb: [{ label: 'المواعيد' }] }
  },
  {
    path: '/appointments/new', name: 'AppointmentCreate',
    component: () => import('@/features/appointments/views/AppointmentForm.vue'),
    meta: { requiresAuth: true, title: 'موعد جديد', permission: 'manage_appointments' }
  },
  {
    path: '/appointments/:id/edit', name: 'AppointmentEdit',
    component: () => import('@/features/appointments/views/AppointmentForm.vue'),
    meta: { requiresAuth: true, title: 'تعديل موعد', permission: 'manage_appointments' }
  },
  {
    path: '/tasks', name: 'Tasks',
    component: () => import('@/features/tasks/views/TasksPage.vue'),
    meta: { requiresAuth: true, title: 'المهام', permission: 'manage_tasks' }
  },
  {
    path: '/diagnoses', name: 'DiagnosesManage',
    component: () => import('@/features/clinical/views/DiagnosesManage.vue'),
    meta: { requiresAuth: true, title: 'التشخيصات', permission: 'manage_options' }
  },
  {
    path: '/medications', name: 'MedicationsManage',
    component: () => import('@/features/clinical/views/MedicationsManage.vue'),
    meta: { requiresAuth: true, title: 'الأدوية', permission: 'manage_options' }
  },
  {
    path: '/backup', name: 'BackupView',
    component: () => import('@/features/backup/views/BackupView.vue'),
    meta: { requiresAuth: true, title: 'النسخ الاحتياطي', permission: 'manage_backup' }
  },
  {
    path: '/change-password', name: 'ChangePassword',
    component: () => import('@/features/settings/views/ChangePassword.vue'),
    meta: { requiresAuth: true, title: 'تغيير كلمة المرور' }
  },
  {
    path: '/settings', name: 'Settings',
    component: () => import('@/features/settings/views/Settings.vue'),
    meta: { requiresAuth: true, title: 'الإعدادات', permission: 'manage_settings' }
  },
  {
    path: '/reports/statistics', name: 'Statistics',
    component: () => import('@/features/reports/views/Statistics.vue'),
    meta: { requiresAuth: true, title: 'الإحصائيات', permission: 'view_reports' }
  },
  {
    path: '/reports/reconciliation', name: 'Reconciliation',
    component: () => import('@/features/reports/views/Reconciliation.vue'),
    meta: { requiresAuth: true, title: 'مطابقة السجلات', permission: 'view_reports', role: 'admin' }
  },
  {
    path: '/invoices', name: 'InvoicesList',
    component: () => import('@/features/billing/views/InvoicesList.vue'),
    meta: { requiresAuth: true, title: 'الفواتير', permission: 'view_billing' }
  },
  {
    path: '/invoices/new', name: 'InvoiceCreate',
    component: () => import('@/features/billing/views/InvoiceForm.vue'),
    meta: { requiresAuth: true, title: 'فاتورة جديدة', permission: 'manage_billing' }
  },
  {
    path: '/invoices/:id/edit', name: 'InvoiceEdit',
    component: () => import('@/features/billing/views/InvoiceForm.vue'),
    meta: { requiresAuth: true, title: 'تعديل فاتورة', permission: 'manage_billing' }
  },
  {
    path: '/templates', name: 'Templates',
    component: () => import('@/features/clinical/views/TemplatesList.vue'),
    meta: { requiresAuth: true, title: 'القوالب', permission: 'manage_templates' }
  },
  {
    path: '/templates/new', name: 'TemplateCreate',
    component: () => import('@/features/clinical/views/TemplateForm.vue'),
    meta: { requiresAuth: true, title: 'قالب جديد', permission: 'manage_templates' }
  },
  {
    path: '/templates/:id/edit', name: 'TemplateEdit',
    component: () => import('@/features/clinical/views/TemplateForm.vue'),
    meta: { requiresAuth: true, title: 'تعديل قالب', permission: 'manage_templates' }
  },
  {
    path: '/users', name: 'Users',
    component: () => import('@/features/settings/views/UsersList.vue'),
    meta: { requiresAuth: true, title: 'المستخدمين', permission: 'manage_users' }
  },
  {
    path: '/users/new', name: 'UserCreate',
    component: () => import('@/features/settings/views/UserForm.vue'),
    meta: { requiresAuth: true, title: 'مستخدم جديد', permission: 'manage_users' }
  },
  {
    path: '/users/:id/edit', name: 'UserEdit',
    component: () => import('@/features/settings/views/UserForm.vue'),
    meta: { requiresAuth: true, title: 'تعديل مستخدم', permission: 'manage_users' }
  },
  {
    path: '/users/:id/permissions', name: 'UserPermissions',
    component: () => import('@/features/settings/views/UserPermissions.vue'),
    meta: { requiresAuth: true, title: 'صلاحيات المستخدم', permission: 'manage_users' }
  },
  {
    path: '/prescription/:visitId', name: 'PrescriptionPreview',
    component: () => import('@/features/prescription/views/PrescriptionPreview.vue'),
    meta: { requiresAuth: true, title: 'روشتة', permission: 'export_pdf' }
  },
  {
    path: '/referrals/visit/:visitId', name: 'ReferralLetter',
    component: () => import('@/features/prescription/views/ReferralLetter.vue'),
    meta: { requiresAuth: true, title: 'خطاب تحويل', permission: 'view_referrals' }
  },
  {
    path: '/notifications', name: 'Notifications',
    component: () => import('@/features/notifications/views/Notifications.vue'),
    meta: { requiresAuth: true, title: 'الإشعارات' }
  },
  {
    path: '/scales', name: 'ScalesAdmin',
    component: () => import('@/features/clinical/views/ScalesAdmin.vue'),
    meta: { requiresAuth: true, title: 'المقاييس', permission: 'manage_options' }
  },
  {
    path: '/import', name: 'ImportData',
    component: () => import('@/features/import/views/ImportData.vue'),
    meta: { requiresAuth: true, title: 'استيراد', permission: 'import_data' }
  },
  {
    path: '/import/options', name: 'ImportOptions',
    component: () => import('@/features/import/views/ImportOptions.vue'),
    meta: { requiresAuth: true, title: 'استيراد الخيارات', permission: 'manage_options' }
  },
  {
    path: '/manual', name: 'Manual',
    component: () => import('@/features/reports/views/ManualView.vue'),
    meta: { title: 'الدليل' }
  },
  {
    path: '/privacy', name: 'PrivacyPolicy',
    component: () => import('@/features/reports/views/PrivacyPolicyView.vue'),
    meta: { title: 'سياسة الخصوصية' }
  },
  {
    path: '/terms', name: 'TermsOfService',
    component: () => import('@/features/reports/views/TermsView.vue'),
    meta: { title: 'شروط الخدمة' }
  },
  {
    path: '/about', name: 'About',
    component: () => import('@/features/reports/views/AboutView.vue'),
    meta: { title: 'حول النظام' }
  },
  {
    path: '/error', name: 'ErrorPage',
    component: () => import('@/features/reports/views/ErrorPage.vue'),
    meta: { title: 'خطأ' }
  },
  // Removed the standalone /404 route to avoid duplicate name.
  // The catch‑all below will handle all 404s.
  // FIX: Catch‑all now renders the 404 page (instead of redirecting to /dashboard)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/features/reports/views/ErrorPage.vue'),
    props: { code: 404 },
    meta: { title: 'غير موجود' }
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return
    return { top: 0 }
  }
})

router.onError((error, to) => {
  const message = String(error?.message || '')
  const isStaleChunk = /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(message)
  if (!isStaleChunk) return
  const reloadKey = `chunk-reload:${to.fullPath}`
  if (!sessionStorage.getItem(reloadKey)) {
    sessionStorage.setItem(reloadKey, '1')
    window.location.assign(to.fullPath)
    return
  }
  sessionStorage.removeItem(reloadKey)
  window.location.assign('/error?reason=deployment')
})

// 1) Cancel any pending requests on each navigation
router.beforeEach(async (to, from, next) => {
  cancelAllPending()
  next()
})

// 2) Attempt to fetch current user if we think we're logged in (for session restore)
router.beforeEach(fetchMeGuard)

// 3) Auth guard: redirect to login if not authenticated
router.beforeEach(authGuard)

// 4) Permission guard: check route meta.permission
router.beforeEach(permissionGuard)

router.afterEach((to) => {
  sessionStorage.removeItem(`chunk-reload:${to.fullPath}`)
  let title = 'نظام العيادة'
  if (to.meta.title) title = to.meta.title + ' | ' + title
  document.title = title
})

if (document.startViewTransition) {
  router.beforeResolve((to, from, next) => {
    document.startViewTransition(() => { next() })
  })
}

export default router
