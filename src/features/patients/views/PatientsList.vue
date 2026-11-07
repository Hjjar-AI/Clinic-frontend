<!-- frontend/src/features/patients/views/PatientsList.vue -->
<template>
  <PageContainer
    :status="pageStatus"
    empty-title="لا توجد سجلات"
    empty-action-text="إضافة مريض جديد"
    :empty-action-url="
      authStore.can('edit_patient') ? { name: 'PatientCreate' } : null
    "
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
            v-if="authStore.can('edit_patient')"
            variant="primary"
            :to="{ name: 'PatientCreate' }"
          >
            <Icon icon="user-plus" /> إضافة مريض جديد
          </BaseButton>
        </div>
      </PageHeader>

      <BaseCard>
        <ListView
          v-model:visible-keys="visibleKeys"
          :refresh-key="listRefresh"
          :columns="allColumns"
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
            {{ item.care_team_names?.join('، ') || '-' }}
          </template>

          <template #registration_date="{ item }">
            <DateCell :date="item.registration_date" />
          </template>

          <template #completeness="{ item }">
            <Badge
              :severity="item.completeness?.complete ? 'success' : 'warning'"
              :label="
                item.completeness?.complete
                  ? 'مكتمل'
                  : `${item.completeness?.percent || 0}%`
              "
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
import { useRoute, useRouter } from 'vue-router'

import PageContainer from '@/components/layout/PageContainer.vue'
import Badge from '@/components/ui/Badge.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DateCell from '@/components/ui/DateCell.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useApi } from '@/composables/useApi'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useCopy } from '@/composables/useCopy'
import { useNotify } from '@/composables/useNotify'
import { usePageStatus } from '@/composables/usePageStatus'
import { useRouteFilters } from '@/composables/useRouteFilters'
import { useTableColumns } from '@/composables/useTableColumns'
import { useAuthStore } from '@/features/auth/stores/auth'
import PatientLink from '@/features/patients/components/PatientLink.vue'
import patientService from '@/features/patients/services/patientService'
import { usePatientStore } from '@/features/patients/stores/patients'
import { useRefreshStore } from '@/stores/refresh'
import { useSelectionStore } from '@/stores/selection'
import { CONFIRM } from '@/utils/confirmMessages'
import { downloadBlob } from '@/utils/download'
import { makeCursorFetchFn } from '@/utils/listFetch'
import { fullName } from '@/utils/normalize'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const authStore = useAuthStore()
const selectionStore = useSelectionStore()

const { confirm } = useConfirmDialog()
const { copy } = useCopy()
const { notify } = useNotify()

const listRefresh = ref(0)
const refreshStore = useRefreshStore()
const { status: pageStatus, setContent, setError } = usePageStatus()

const filters = useRouteFilters({
  search: '',
  completeness: '',
  active: '',
  sort_by: 'name',
  sort_order: 'asc',
})

const allColumns = computed(() => [
  { key: 'patient_number', label: 'رقم الملف', fixed: true },
  { key: 'name', label: 'الاسم', fixed: true },
  { key: 'national_id', label: 'الرقم الوطني' },
  { key: 'phone', label: 'الهاتف' },
  ...(authStore.can('view_patients')
    ? [{ key: 'doctor', label: 'فريق الرعاية' }]
    : []),
  { key: 'registration_date', label: 'تاريخ التسجيل' },
  { key: 'completeness', label: 'اكتمال الملف' },
])
const { visibleKeys } = useTableColumns(
  allColumns,
  () =>
    `${route.name}:${allColumns.value.map((column) => column.key).join('|')}`,
)
const visibleColumns = computed(() =>
  allColumns.value.filter((column) => visibleKeys.value.includes(column.key)),
)

const exportFields = computed(() =>
  visibleColumns.value
    .map(
      (column) =>
        ({
          name: 'full_name',
          patient_number: 'patient_number',
          national_id: 'national_id',
          phone: 'phone',
          doctor: 'doctor',
          registration_date: 'registration_date',
          completeness: 'completeness',
        })[column.key],
    )
    .filter(Boolean),
)

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
  ...(authStore.user?.role === 'admin'
    ? [
        {
          key: 'active',
          type: 'select',
          placeholder: 'حالة الملف',
          options: [
            { value: 'true', label: 'نشط' },
            { value: 'false', label: 'مؤرشف / غير نشط' },
          ],
        },
      ]
    : []),
  {
    key: 'sort_by',
    type: 'select',
    placeholder: 'الفرز حسب',
    options: [
      { value: 'name', label: 'الاسم' },
      { value: 'registration_date', label: 'تاريخ التسجيل' },
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
    filters.value = {}
  }
}

function missingFieldsLabel(fields = []) {
  const labels = {
    dob_year: 'سنة الميلاد',
    gender: 'الجنس',
    national_id: 'الرقم الوطني',
    phone: 'الهاتف',
    doctor: 'فريق الرعاية',
    registration_date: 'تاريخ التسجيل',
  }
  return fields.length
    ? `الحقول الناقصة: ${fields.map((field) => labels[field] || field).join('، ')}`
    : 'الملف مكتمل'
}

async function deletePatient(patient) {
  try {
    await patientStore.deletePatient(patient.id)
    listRefresh.value += 1
    selectionStore.clearAll()
    notify('تم حذف المريض', 'success')
  } catch {
    notify('فشل حذف المريض', 'danger')
  }
}

async function handlePdfDownload(patientId) {
  try {
    const blob = await patientService.exportPdf(patientId)
    downloadBlob(blob, `patient_${patientId}.pdf`)
  } catch {
    notify('فشل تصدير PDF', 'danger')
  }
}

async function handleWordDownload(patientId) {
  try {
    const blob = await patientService.exportWord(patientId)
    downloadBlob(blob, `patient_${patientId}.docx`)
  } catch {
    notify('فشل تصدير Word', 'danger')
  }
}

const { loading: exportingCsv, execute: doExportCsv } = useApi(async () => {
  const blob = await patientService.exportCsv(
    exportFields.value,
    exportFilters.value,
  )
  downloadBlob(blob, 'patients_export.csv')
})

const { loading: exportingExcel, execute: doExportExcel } = useApi(async () => {
  const blob = await patientService.exportExcel(
    exportFields.value,
    exportFilters.value,
  )
  downloadBlob(blob, 'patients_export.xlsx')
})

function handleExportAll(format) {
  if (format === 'csv') doExportCsv()
  else doExportExcel()
}

onMounted(() => {
  // PageContainer only renders its slot (and therefore mounts ListView)
  // when `status === 'content'`. Previously this file set `'loading'` and
  // never advanced, so ListView never mounted and never fetched. Let
  // ListView own its own loading state instead.
  setContent()
})
</script>
