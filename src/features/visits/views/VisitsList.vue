<template>
  <VisitsListLayout
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
import { computed } from 'vue'

import { useApi } from '@/composables/useApi'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useNotify } from '@/composables/useNotify'
import { useRouteQuery } from '@/composables/useRouteQuery'
import { useAuthStore } from '@/features/auth/stores/auth'
import VisitsListLayout from '@/features/visits/components/VisitsListLayout.vue'
import visitService from '@/features/visits/services/visitService'
import { CONFIRM } from '@/utils/confirmMessages'
import { makeCursorFetchFn } from '@/utils/listFetch'

const authStore = useAuthStore()
const { notify } = useNotify()
const { confirm } = useConfirmDialog()

const statusFilter = useRouteQuery('status', '')
const clinicalStatusFilter = useRouteQuery('clinical_status', '')
const dateFromFilter = useRouteQuery('date_from', '')
const dateToFilter = useRouteQuery('date_to', '')
const searchFilter = useRouteQuery('search', '')
const sortByFilter = useRouteQuery('sort_by', 'date')
const sortOrderFilter = useRouteQuery('sort_order', 'desc')

const filters = computed({
  get: () => ({
    search: searchFilter.value,
    status: statusFilter.value,
    clinical_status: clinicalStatusFilter.value,
    date_from: dateFromFilter.value,
    date_to: dateToFilter.value,
    sort_by: sortByFilter.value,
    sort_order: sortOrderFilter.value,
  }),
  set: (value) => {
    searchFilter.value = value.search || ''
    statusFilter.value = value.status || ''
    clinicalStatusFilter.value = value.clinical_status || ''
    dateFromFilter.value = value.date_from || ''
    dateToFilter.value = value.date_to || ''
    sortByFilter.value = value.sort_by || 'date'
    sortOrderFilter.value = value.sort_order || 'desc'
  },
})

const columns = [
  { key: 'patient_name', label: 'المريض' },
  { key: 'visit_date', label: 'تاريخ الزيارة' },
  { key: 'main_complaints', label: 'الشكوى' },
  { key: 'status', label: 'الحالة' },
  { key: 'clinical_status', label: 'الحالة السريرية' },
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
      { value: 'draft', label: 'مسودة' },
      { value: 'final', label: 'نهائية' },
      { value: 'amended', label: 'معدلة' },
      { value: 'locked', label: 'مقفلة' },
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

const { execute: doDelete } = useApi((id) => visitService.delete(id))

async function deleteVisit(visit) {
  const ok = await confirm(
    `سيتم أرشفة مسودة زيارة ${visit.patient?.full_name || 'المريض'}. هل تريد المتابعة؟`,
    { confirmText: 'أرشفة المسودة' }
  )

  if (!ok) return

  await doDelete(visit.id)
  notify('تمت أرشفة مسودة الزيارة', 'success')
}

async function confirmResetFilters() {
  const ok = await confirm(CONFIRM.CLEAR_FILTERS)

  if (!ok) return

  statusFilter.value = ''
  clinicalStatusFilter.value = ''
  dateFromFilter.value = ''
  dateToFilter.value = ''
  searchFilter.value = ''
  sortByFilter.value = 'date'
  sortOrderFilter.value = 'desc'
}

function refreshAll() {
  // ListView automatically refreshes when filters change.
}
</script>
