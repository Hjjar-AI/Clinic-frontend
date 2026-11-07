<template>
  <VisitsListLayout
    :refresh-key="listRefresh"
    :columns="columns"
    :fetch-fn="fetchFn"
    :table-filters="tableFilters"
    :filters="filters"
    :can-delete="authStore.can('delete_visit')"
    :can-edit="authStore.can('edit_visit')"
    :can-export="authStore.can('export_pdf')"
    @update:filters="filters = $event"
    @filter-apply="refreshAll"
    @filter-reset="confirmResetFilters"
    @delete-visit="deleteVisit"
    @export-pdf="exportVisitPdf"
  />
</template>

<script setup>
import { computed, ref } from 'vue'

import { useApi } from '@/composables/useApi'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useNotify } from '@/composables/useNotify'
import { useRouteFilters } from '@/composables/useRouteFilters'
import { statusPresentation } from '@/constants/statusPresentation'
import { useAuthStore } from '@/features/auth/stores/auth'
import VisitsListLayout from '@/features/visits/components/VisitsListLayout.vue'
import visitService from '@/features/visits/services/visitService'
import { CONFIRM } from '@/utils/confirmMessages'
import { makeCursorFetchFn } from '@/utils/listFetch'

const authStore = useAuthStore()
const { notify } = useNotify()
const { confirm } = useConfirmDialog()

const filters = useRouteFilters({
  search: '',
  status: '',
  clinical_status: '',
  date_from: '',
  date_to: '',
  sort_by: 'date',
  sort_order: 'desc',
})

const columns = [
  { key: 'patient_name', sortKey: 'patient', label: 'المريض' },
  { key: 'visit_date', sortKey: 'date', label: 'تاريخ الزيارة' },
  { key: 'main_complaints', label: 'الشكوى' },
  { key: 'status', sortKey: 'status', label: 'الحالة' },
  {
    key: 'clinical_status',
    sortKey: 'clinical_status',
    label: 'الحالة السريرية',
  },
]

const tableFilters = computed(() => [
  {
    key: 'search',
    type: 'text',
    placeholder: 'اسم المريض أو الشكوى',
  },
  {
    key: 'status',
    type: 'status',
    placeholder: 'جميع الحالات',
    options: [
      { value: '', label: 'جميع الحالات' },
      ...['draft', 'final', 'amended', 'locked'].map((value) => ({
        value,
        label: statusPresentation('visit', value).label,
      })),
    ],
  },
  {
    key: 'clinical_status',
    type: 'status',
    placeholder: 'الحالة السريرية',
    options: [
      { value: '', label: 'كل الحالات السريرية' },
      { value: 'تحسن', label: 'تحسن' },
      { value: 'تحسن جزئي', label: 'تحسن جزئي' },
      { value: 'غير مستقر', label: 'غير مستقر' },
      { value: 'انتكاس مع أخذ الدواء', label: 'انتكاس مع أخذ الدواء' },
      { value: 'انتكاس بعد ترك الدواء', label: 'انتكاس بعد ترك الدواء' },
    ],
  },
  {
    key: 'date',
    type: 'date',
    placeholder: 'تاريخ الزيارة',
  },
  {
    key: 'sort_by',
    type: 'select',
    placeholder: 'الفرز حسب',
    options: [
      { value: 'date', label: 'تاريخ الزيارة' },
      { value: 'patient', label: 'المريض' },
      { value: 'status', label: 'حالة التوثيق' },
      { value: 'clinical_status', label: 'الحالة السريرية' },
      { value: 'updated_at', label: 'آخر تحديث' },
    ],
  },
  {
    key: 'sort_order',
    type: 'select',
    placeholder: 'اتجاه الفرز',
    options: [
      { value: 'asc', label: 'تصاعدي' },
      { value: 'desc', label: 'تنازلي' },
    ],
  },
])

const fetchFn = makeCursorFetchFn(visitService, {
  getParams: (f) => ({
    search: f?.search || undefined,
    status: f?.status || undefined,
    clinical_status: f?.clinical_status || undefined,
    date_from: f?.date_from || undefined,
    date_to: f?.date_to || undefined,
    sort_by: f?.sort_by || undefined,
    sort_order: f?.sort_order || undefined,
  }),
})

function exportVisitPdf(visitId) {
  notify('جاري إنشاء ملف PDF للزيارة...', 'info')
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  window.open(`${base}/exports/visits/${visitId}/pdf/`, '_blank')
}

const listRefresh = ref(0)
const { execute: doDelete } = useApi(
  (visit) => visitService.delete(visit.id, visit.version),
  { silent: true },
)

async function deleteVisit(visit) {
  try {
    await doDelete(visit)
    listRefresh.value += 1
    notify('تمت أرشفة مسودة الزيارة', 'success')
  } catch {
    // Shared API handling presents failure/conflict; retain the displayed list.
  }
}

async function confirmResetFilters() {
  const ok = await confirm(CONFIRM.CLEAR_FILTERS)

  if (!ok) return

  filters.value = {}
}

function refreshAll() {
  // ListView automatically refreshes when filters change.
}
</script>
