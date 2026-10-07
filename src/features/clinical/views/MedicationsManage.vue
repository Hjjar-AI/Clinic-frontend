<!-- frontend/src/views/MedicationsManage.vue -->
<template>
  <div class="medications-management-view">
    <Breadcrumb :items="[{ label: 'الأدوية' }]" />
    <PageHeader
      title="قائمة الأدوية"
      subtitle="الأدوية المعتمدة في الوصفات الطبية."
    >
      <div class="flex flex--gap-2">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="handleExportExcel"
        >
          <Icon icon="file-excel" /> تصدير Excel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          @click="openFormModal(null)"
        >
          <Icon icon="plus" /> إضافة دواء جديد
        </BaseButton>
      </div>
    </PageHeader>

    <BaseCard>
      <div class="card__body">
        <ListView
          :columns="columns"
          :fetch-fn="fetchFn"
          :filters="tableFilters"
          :filter-values="filters"
          :refresh-key="refreshKey"
          empty-type="search"
          empty-title="لا توجد نتائج"
          @update:filter-values="filters = $event"
          @filter-reset="resetFilters"
        >
          <template #generic_english="{ item }">
            {{ item.generic_english }}
            <BaseButton
              variant="ghost"
              size="xs"
              aria-label="نسخ"
              @click.stop="copyItem(item.generic_english)"
            >
              <Icon
                icon="copy"
                class="text-xs text-muted"
              />
            </BaseButton>
          </template>
          <template #generic_arabic="{ item }">
            {{ item.generic_arabic || '' }}
          </template>
          <template #dosage="{ item }">
            <BadgeCell
              color="primary"
              variant="soft"
              :value="item.dosage || ''"
            >
              {{ item.dosage || '' }}
            </BadgeCell>
          </template>
          <template #brand_english="{ item }">
            {{ item.brand_english || '' }}
          </template>
          <template #brand_arabic="{ item }">
            {{ item.brand_arabic || '' }}
          </template>
          <template #usage_count="{ item }">
            {{ item.usage_count || 0 }}
          </template>
          <template #actions="{ item }">
            <TableActions
              :edit-to="null"
              :show-view="false"
              :show-edit="item.is_active !== false"
              :show-delete="item.is_active !== false"
              :confirm-message="`سيتم إيقاف هذا الدواء مع الاحتفاظ به في ${item.usage_count || 0} زيارة سابقة. هل تريد المتابعة؟`"
              @edit="openFormModal(item)"
              @delete="handleDeleteMedication(item.id)"
            >
              <BaseButton
                v-if="item.is_active === false"
                variant="ghost"
                size="xs"
                icon="rotate-left"
                title="إعادة التفعيل"
                @click.stop="handleReactivateMedication(item.id)"
              />
            </TableActions>
          </template>
        </ListView>
      </div>
    </BaseCard>

    <BaseModal
      v-model="modalOpen"
      :title="isEditing ? 'تعديل دواء' : 'دواء جديد'"
      confirm-text="حفظ"
      @confirm="handleSaveMedication"
    >
      <div class="flex flex--column gap-3">
        <FormField
          label="الاسم العام (إنجليزي) *"
          field-id="medGenericEnglish"
          required
        >
          <input
            id="medGenericEnglish"
            v-model="form.generic_english"
            class="form-control"
            required
          >
        </FormField>
        <FormField
          label="الاسم العام (عربي)"
          field-id="medGenericArabic"
        >
          <input
            id="medGenericArabic"
            v-model="form.generic_arabic"
            class="form-control"
          >
        </FormField>
        <FormField
          label="الجرعة"
          field-id="medDosage"
        >
          <input
            id="medDosage"
            v-model="form.dosage"
            class="form-control"
          >
        </FormField>
        <FormField
          label="العلامة التجارية (إنجليزي)"
          field-id="medBrandEnglish"
        >
          <input
            id="medBrandEnglish"
            v-model="form.brand_english"
            class="form-control"
          >
        </FormField>
        <FormField
          label="العلامة التجارية (عربي)"
          field-id="medBrandArabic"
        >
          <input
            id="medBrandArabic"
            v-model="form.brand_arabic"
            class="form-control"
          >
        </FormField>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import BadgeCell from '@/components/ui/BadgeCell.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormField from '@/components/ui/FormField.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useApi } from '@/composables/useApi'
import { useCopy } from '@/composables/useCopy'
import { useNotify } from '@/composables/useNotify'
import { useRouteQuery } from '@/composables/useRouteQuery'
import medicationService from '@/features/clinical/services/medicationService'
import { useLookupStore } from '@/stores/lookups'
import { downloadBlob } from '@/utils/download'
import { makeCursorFetchFn } from '@/utils/listFetch'

const { copy } = useCopy()
const { notify } = useNotify()
const lookupStore = useLookupStore()

const searchQuery = useRouteQuery('search', '')
const activityQuery = useRouteQuery('activity', '')
const sortByQuery = useRouteQuery('sort_by', 'order')
const sortOrderQuery = useRouteQuery('sort_order', 'asc')

const modalOpen = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const form = ref({
  generic_english: '',
  generic_arabic: '',
  dosage: '',
  brand_english: '',
  brand_arabic: '',
})

const refreshKey = ref(0)

const filters = computed({
  get: () => ({
    search: searchQuery.value,
    activity: activityQuery.value,
    sort_by: sortByQuery.value,
    sort_order: sortOrderQuery.value,
  }),
  set: (value) => {
    searchQuery.value = value.search || ''
    activityQuery.value = value.activity || ''
    sortByQuery.value = value.sort_by || 'order'
    sortOrderQuery.value = value.sort_order || 'asc'
  },
})

const tableFilters = [
  { key: 'search', type: 'text', placeholder: 'ابحث بالاسم أو الجرعة' },
  { key: 'activity', type: 'select', placeholder: 'جميع الحالات', options: [
    { value: '', label: 'جميع الحالات' },
    { value: 'active', label: 'النشطة' },
    { value: 'inactive', label: 'المتقاعدة' },
  ] },
  { key: 'sort_by', type: 'select', placeholder: 'الفرز حسب', options: [
    { value: 'order', label: 'الترتيب المعتمد' },
    { value: 'generic_english', label: 'الاسم الإنجليزي' },
    { value: 'generic_arabic', label: 'الاسم العربي' },
    { value: 'dosage', label: 'الجرعة' },
    { value: 'usage_count', label: 'عدد الاستخدامات' },
  ] },
  { key: 'sort_order', type: 'select', placeholder: 'اتجاه الفرز', options: [
    { value: 'asc', label: 'تصاعدي' },
    { value: 'desc', label: 'تنازلي' },
  ] },
]

const columns = [
  { key: 'generic_english', label: 'إنجليزي' },
  { key: 'generic_arabic', label: 'عربي' },
  { key: 'dosage', label: 'الجرعة' },
  { key: 'brand_english', label: 'علامة (EN)' },
  { key: 'brand_arabic', label: 'علامة (AR)' },
  { key: 'usage_count', label: 'عدد الاستخدامات' },
]

const fetchFn = makeCursorFetchFn(medicationService, {
  getParams: (values) => ({ ...values, include_inactive: true }),
})

function refreshList() {
  lookupStore.invalidateMedications()
  refreshKey.value++
}

function copyItem(text) {
  if (text) copy(text)
}

function openFormModal(medication) {
  if (medication) {
    isEditing.value = true
    currentId.value = medication.id

    form.value = {
      generic_english: medication.generic_english || '',
      generic_arabic: medication.generic_arabic || '',
      dosage: medication.dosage || '',
      brand_english: medication.brand_english || '',
      brand_arabic: medication.brand_arabic || '',
    }
  } else {
    isEditing.value = false
    currentId.value = null

    form.value = {
      generic_english: '',
      generic_arabic: '',
      dosage: '',
      brand_english: '',
      brand_arabic: '',
    }
  }

  modalOpen.value = true
}

const { execute: execSave } = useApi(async () => {
  if (isEditing.value) {
    await medicationService.update(currentId.value, form.value)
  } else {
    await medicationService.create(form.value)
  }

  modalOpen.value = false
  refreshList()
})

const handleSaveMedication = () => execSave()

const handleDeleteMedication = async (id) => {
  try {
    await medicationService.delete(id)
  refreshList()
  } catch {
    notify('لا يمكن حذف هذا الدواء', 'danger')
  }
}

const handleReactivateMedication = async (id) => {
  await medicationService.reactivate(id)
  notify('تمت إعادة تفعيل الدواء', 'success')
  refreshList()
}

function resetFilters() {
  filters.value = {}
}

const { execute: handleExportExcel } = useApi(async () => {
  const response = await medicationService.export(filters.value)
  downloadBlob(response, 'medications.xlsx')
  notify('تم تنزيل الأدوية الظاهرة حسب المرشحات', 'success')
})
</script>
