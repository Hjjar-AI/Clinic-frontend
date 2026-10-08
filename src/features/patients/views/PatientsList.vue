<!-- frontend/src/features/patients/views/PatientsList.vue -->
<template>
  <PageContainer
    :status="pageStatus"
    empty-title="لا توجد سجلات"
    empty-action-text="إضافة مريض جديد"
    :empty-action-url="authStore.can('edit_patient') ? { name: 'PatientCreate' } : null"
  >
    <div class="patients-page-wrapper">
      <Breadcrumb />

      <PageHeader
        title="سجلات المرضى"
        subtitle="إدارة ملفات المرضى والزيارات والعلامات السريرية"
      >
        <div class="flex gap-2">
          <BaseButton
            v-if="authStore.can('export_reports')"
            variant="secondary"
            size="sm"
            :loading="exportingCsv"
            @click="handleExportAll('csv')"
          >
            <Icon icon="file-csv" /> تصدير CSV
          </BaseButton>

          <BaseButton
            v-if="authStore.can('export_reports')"
            variant="secondary"
            size="sm"
            :loading="exportingExcel"
            @click="handleExportAll('excel')"
          >
            <Icon icon="file-excel" /> تصدير Excel
          </BaseButton>

          <BaseButton
            variant="ghost"
            size="sm"
            aria-label="اختيار أعمدة قائمة المرضى"
            @click="showColumns = !showColumns"
          >
            <Icon icon="columns" /> الأعمدة
          </BaseButton>

          <BaseButton
            v-if="authStore.can('edit_patient')"
            variant="primary"
            :to="{ name: 'PatientCreate' }"
          >
            <Icon icon="user-plus" /> إضافة مريض جديد
          </BaseButton>
        </div>
      </PageHeader>

      <ColumnVisibilityPanel
        :visible="showColumns"
        :columns="configurableColumns"
        @toggle-column="toggleColumn"
      />

      <BaseCard>
        <ListView
          :columns="visibleColumns"
          :fetch-fn="fetchPatients"
          :filters="tableFilters"
          :filter-values="filters"
          :selectable="true"
          :selected-ids="selectionStore.selectedIds"
          empty-type="patients"
          empty-title="لا توجد نتائج"
          :date-fields="['date_from', 'date_to']"
          @update:filter-values="filters = $event"
          @filter-apply="refreshAll"
          @filter-reset="confirmResetFilters"
          @toggle-all="toggleAll"
          @toggle-item="(id) => selectionStore.toggle(id)"
          @row-click="goToPatient"
        >
          <template #name="{ item }">
            <PatientLink
              :id="item.id"
              :first-name="item.first_name"
              :surname="item.surname"
              :phone="item.phone"
              :last-visit="item.last_visit_date"
              :important-notes="item.important_notes"
              :highlight="item._highlight"
            />
          </template>

          <template #national_id="{ item }">
            <div class="flex flex--center gap-1">
              <span>{{ item.national_id || '-' }}</span>
              <BaseButton
                v-if="item.national_id"
                variant="ghost"
                size="xs"
                aria-label="نسخ الرقم الوطني"
                @click.stop="copyItem(item.national_id)"
              >
                <Icon
                  icon="copy"
                  class="text-xs text-muted"
                />
              </BaseButton>
            </div>
          </template>

          <template #phone="{ item }">
            <div class="flex flex--center gap-1">
              <span>{{ item.phone || '-' }}</span>
              <BaseButton
                v-if="item.phone"
                variant="ghost"
                size="xs"
                aria-label="نسخ رقم الهاتف"
                @click.stop="copyItem(item.phone)"
              >
                <Icon
                  icon="copy"
                  class="text-xs text-muted"
                />
              </BaseButton>
            </div>
          </template>

          <template #doctor="{ item }">
            {{ item.doctor_name || '-' }}
          </template>

          <template #admission_date="{ item }">
            <DateCell :date="item.admission_date" />
          </template>

          <template #completeness="{ item }">
            <Badge
              :severity="item.completeness?.complete ? 'success' : 'warning'"
              :label="item.completeness?.complete ? 'مكتمل' : `${item.completeness?.percent || 0}%`"
              :title="missingFieldsLabel(item.completeness?.missing_fields)"
            />
          </template>

          <template #actions="{ item }">
            <TableActions
              :show-view="true"
              :show-edit="authStore.can('edit_patient')"
              :view-to="{ name: 'PatientDetail', params: { id: item.id } }"
              :edit-to="{ name: 'PatientEdit', params: { id: item.id } }"
              :show-delete="authStore.can('delete_patient')"
              :confirm-message="CONFIRM.DELETE_WITH_NAME(fullName(item))"
              @delete="deletePatient(item)"
            >
              <BaseButton
                v-if="authStore.can('add_visit')"
                variant="ghost"
                size="xs"
                icon="file-medical"
                title="زيارة جديدة"
                :to="{ name: 'VisitCreate', params: { patientId: item.id } }"
              />

              <BaseButton
                v-if="authStore.can('export_pdf')"
                variant="ghost"
                size="xs"
                icon="file-pdf"
                title="تصدير PDF"
                @click.stop="handlePdfDownload(item.id)"
              />

              <BaseButton
                v-if="authStore.can('export_word')"
                variant="ghost"
                size="xs"
                icon="file-word"
                title="تصدير Word"
                @click.stop="handleWordDownload(item.id)"
              />
            </TableActions>
          </template>
        </ListView>
      </BaseCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PageContainer from '@/components/layout/PageContainer.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import Badge from '@/components/ui/Badge.vue'
import DateCell from '@/components/ui/DateCell.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useApi } from '@/composables/useApi'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useCopy } from '@/composables/useCopy'
import { useNotify } from '@/composables/useNotify'
import { usePageStatus } from '@/composables/usePageStatus'
import { useRouteQuery } from '@/composables/useRouteQuery'
import { useAuthStore } from '@/features/auth/stores/auth'
import PatientLink from '@/features/patients/components/PatientLink.vue'
import ColumnVisibilityPanel from '@/features/patients/components/ColumnVisibilityPanel.vue'
import patientService from '@/features/patients/services/patientService'
import { usePatientStore } from '@/features/patients/stores/patients'
import { useRefreshStore } from '@/stores/refresh'
import { useSelectionStore } from '@/stores/selection'
import { CONFIRM } from '@/utils/confirmMessages'
import { makeCursorFetchFn } from '@/utils/listFetch'
import { fullName } from '@/utils/normalize'

const router = useRouter()
const patientStore = usePatientStore()
const authStore = useAuthStore()
const selectionStore = useSelectionStore()

const { confirm } = useConfirmDialog()
const { copy } = useCopy()
const { notify } = useNotify()

const refreshStore = useRefreshStore()
const {
  status: pageStatus,
  setContent,
  setError,
} = usePageStatus()

const searchQuery = useRouteQuery('search', '')
const completenessQuery = useRouteQuery('completeness', '')
const activeQuery = useRouteQuery('active', '')
const sortByQuery = useRouteQuery('sort_by', 'name')
const sortOrderQuery = useRouteQuery('sort_order', 'asc')

const filters = computed({
  get: () => ({
    search: searchQuery.value,
    completeness: completenessQuery.value,
    active: activeQuery.value,
    sort_by: sortByQuery.value,
    sort_order: sortOrderQuery.value,
  }),
  set: (value) => {
    searchQuery.value = value.search || ''
    completenessQuery.value = value.completeness || ''
    activeQuery.value = value.active || ''
    sortByQuery.value = value.sort_by || 'name'
    sortOrderQuery.value = value.sort_order || 'asc'
  },
})

const showColumns = ref(false)
const columnVisibility = ref({
  national_id: true,
  phone: true,
  doctor: true,
  admission_date: true,
  completeness: true,
})

const allColumns = computed(() => [
  { key: 'name', label: 'الاسم' },
  { key: 'national_id', label: 'الرقم الوطني', visible: columnVisibility.value.national_id },
  { key: 'phone', label: 'الهاتف', visible: columnVisibility.value.phone },
  { key: 'doctor', label: 'الطبيب المسؤول', visible: columnVisibility.value.doctor && authStore.can('view_patients') },
  { key: 'admission_date', label: 'تاريخ الإضافة', visible: columnVisibility.value.admission_date },
  { key: 'completeness', label: 'اكتمال الملف', visible: columnVisibility.value.completeness },
])

const visibleColumns = computed(() => allColumns.value.filter((column) => column.visible !== false))
const configurableColumns = computed(() => allColumns.value
  .filter((column) => column.key !== 'name' && (column.key !== 'doctor' || authStore.can('view_patients')))
  .map((column) => ({ ...column, visible: columnVisibility.value[column.key] !== false })))

const exportFields = computed(() => visibleColumns.value.map((column) => ({
  name: 'full_name',
  national_id: 'national_id',
  phone: 'phone',
  doctor: 'doctor',
  admission_date: 'admission_date',
  completeness: 'completeness',
}[column.key])).filter(Boolean))

const exportFilters = computed(() => ({
  ...filters.value,
  include_archived: filters.value.active === 'false' ? 'true' : undefined,
}))

const tableFilters = computed(() => [
  {
    key: 'search',
    type: 'text',
    placeholder: 'ابحث باسم المريض...',
  },
  {
    key: 'completeness',
    type: 'select',
    placeholder: 'اكتمال الملف',
    options: [
      { value: 'complete', label: 'مكتمل' },
      { value: 'incomplete', label: 'غير مكتمل' },
    ],
  },
  ...(authStore.user?.role === 'admin' ? [{
    key: 'active',
    type: 'select',
    placeholder: 'حالة الملف',
    options: [
      { value: 'true', label: 'نشط' },
      { value: 'false', label: 'مؤرشف / غير نشط' },
    ],
  }] : []),
  {
    key: 'sort_by',
    type: 'select',
    placeholder: 'الفرز حسب',
    options: [
      { value: 'name', label: 'الاسم' },
      { value: 'admission_date', label: 'تاريخ الإضافة' },
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

// Base cursor fetch via the shared factory.
// `getParams` maps the view's filter object into query params.
const baseFetchPatients = makeCursorFetchFn(patientService, {
  getParams: (activeFilters) => ({
    search: activeFilters?.search || undefined,
    completeness: activeFilters?.completeness || undefined,
    active: activeFilters?.active || undefined,
    include_archived: activeFilters?.active === 'false' ? 'true' : undefined,
    sort_by: activeFilters?.sort_by || undefined,
    sort_order: activeFilters?.sort_order || undefined,
  }),
})

// Wrapper that preserves the view's side effects (`refreshStore.touch()`
// for the topbar "last refreshed" indicator) and drives `pageStatus` for
// the PageContainer. Errors bubble up so ListView can render its own
// error state through usePagination.
const fetchPatients = async (args) => {
  try {
    const result = await baseFetchPatients(args)
    setContent()
    refreshStore.touch()
    return result
  } catch (err) {
    setError()
    throw err
  }
}

function goToPatient(item) {
  router.push({ name: 'PatientDetail', params: { id: item.id } })
}

function toggleAll(selectAll, ids) {
  if (selectAll) {
    selectionStore.selectAll(ids)
  } else {
    selectionStore.clearAll()
  }
}

function refreshAll() {
  // ListView automatically refreshes when filters change.
}

function copyItem(text) {
  if (text && text !== '-') copy(text)
}

async function confirmResetFilters() {
  const ok = await confirm(CONFIRM.CLEAR_FILTERS)
  if (ok) {
    searchQuery.value = ''
    completenessQuery.value = ''
    activeQuery.value = ''
    sortByQuery.value = 'name'
    sortOrderQuery.value = 'asc'
  }
}

function toggleColumn(key, visible) {
  columnVisibility.value = { ...columnVisibility.value, [key]: visible }
  window.localStorage.setItem('patients:list-columns', JSON.stringify(columnVisibility.value))
}

function missingFieldsLabel(fields = []) {
  const labels = {
    dob_year: 'سنة الميلاد',
    gender: 'الجنس',
    national_id: 'الرقم الوطني',
    phone: 'الهاتف',
    doctor: 'الطبيب المسؤول',
    admission_date: 'تاريخ الإضافة',
  }
  return fields.length ? `الحقول الناقصة: ${fields.map((field) => labels[field] || field).join('، ')}` : 'الملف مكتمل'
}

async function deletePatient(patient) {
  try {
    await patientStore.deletePatient(patient.id)
    notify('تم حذف المريض', 'success')
  } catch {
    notify('فشل حذف المريض', 'danger')
  }
}

async function handlePdfDownload(patientId) {
  try {
    const blob = await patientService.exportPdf(patientId)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patient_${patientId}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch {
    notify('فشل تصدير PDF', 'danger')
  }
}

async function handleWordDownload(patientId) {
  try {
    const blob = await patientService.exportWord(patientId)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patient_${patientId}.docx`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch {
    notify('فشل تصدير Word', 'danger')
  }
}

const { loading: exportingCsv, execute: doExportCsv } = useApi(async () => {
  const blob = await patientService.exportCsv(exportFields.value, exportFilters.value)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'patients_export.csv'
  a.click()
  window.URL.revokeObjectURL(url)
})

const { loading: exportingExcel, execute: doExportExcel } = useApi(async () => {
  const blob = await patientService.exportExcel(exportFields.value, exportFilters.value)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'patients_export.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)
})

function handleExportAll(format) {
  if (format === 'csv') doExportCsv()
  else doExportExcel()
}

onMounted(() => {
  try {
    const saved = JSON.parse(window.localStorage.getItem('patients:list-columns') || '{}')
    columnVisibility.value = { ...columnVisibility.value, ...saved }
  } catch {
    // Ignore invalid browser preferences and retain safe defaults.
  }
  // PageContainer only renders its slot (and therefore mounts ListView)
  // when `status === 'content'`. Previously this file set `'loading'` and
  // never advanced, so ListView never mounted and never fetched. Let
  // ListView own its own loading state instead.
  setContent()
})
</script>
