<!-- frontend/src/views/MedicationsManage.vue -->
<template>
  <div class="medications-management-view">
    <Breadcrumb :items="[{ label: 'الأدوية' }]" />
    <PageHeader
      title="قائمة الأدوية"
      subtitle="الأدوية المعتمدة في الوصفات الطبية."
    >
      <div class="flex gap-2">
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
      :loading="saving"
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
import {} from 'vue'

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
import { useRouteFilters } from '@/composables/useRouteFilters'
import { useCatalogEditor } from '@/features/clinical/composables/useCatalogEditor'
import medicationService from '@/features/clinical/services/medicationService'
import { useLookupStore } from '@/features/clinical/stores/lookups'
import { downloadBlob } from '@/utils/download'
import { makeCursorFetchFn } from '@/utils/listFetch'

const { copy } = useCopy()
const { notify } = useNotify()
const lookupStore = useLookupStore()

const {
  modalOpen,
  isEditing,
  form,
  refreshKey,
  refreshList,
  openFormModal,
  saving,
  save: handleSaveMedication,
} = useCatalogEditor({
  defaults: () => ({
    generic_english: '',
    generic_arabic: '',
    dosage: '',
    brand_english: '',
    brand_arabic: '',
  }),
  hydrate: (item) => ({
    generic_english: item.generic_english || '',
    generic_arabic: item.generic_arabic || '',
    dosage: item.dosage || '',
    brand_english: item.brand_english || '',
    brand_arabic: item.brand_arabic || '',
  }),
  create: (payload) => medicationService.create(payload),
  update: (id, payload) => medicationService.update(id, payload),
  invalidate: () => lookupStore.invalidateMedications(),
})

const filters = useRouteFilters({
  search: '',
  activity: '',
  sort_by: 'order',
  sort_order: 'asc',
})

const tableFilters = [
  { key: 'search', type: 'text', placeholder: 'ابحث بالاسم أو الجرعة' },
  {
    key: 'activity',
    type: 'select',
    placeholder: 'جميع الحالات',
    options: [
      { value: '', label: 'جميع الحالات' },
      { value: 'active', label: 'النشطة' },
      { value: 'inactive', label: 'المتقاعدة' },
    ],
  },
  {
    key: 'sort_by',
    type: 'select',
    placeholder: 'الفرز حسب',
    options: [
      { value: 'order', label: 'الترتيب المعتمد' },
      { value: 'generic_english', label: 'الاسم الإنجليزي' },
      { value: 'generic_arabic', label: 'الاسم العربي' },
      { value: 'dosage', label: 'الجرعة' },
      { value: 'usage_count', label: 'عدد الاستخدامات' },
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

function copyItem(text) {
  if (text) copy(text)
}

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
