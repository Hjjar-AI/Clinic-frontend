<!-- frontend/src/views/DiagnosesManage.vue -->
<template>
  <div class="diagnoses-management-view">
    <Breadcrumb :items="[{ label: 'التشخيصات' }]" />
    <PageHeader
      title="مكتبة التشخيصات"
      subtitle="قائمة معايير التشخيص المعتمدة."
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
          <Icon icon="plus" /> إضافة تشخيص جديد
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
          <template #code="{ item }">
            <span class="tag tag--code">{{ item.code }}</span>
            <BaseButton
              variant="ghost"
              size="xs"
              aria-label="نسخ الكود"
              @click.stop="copyItem(item.code)"
            >
              <Icon
                icon="copy"
                class="text-xs text-muted"
              />
            </BaseButton>
          </template>
          <template #english_name="{ item }">
            {{ item.english_name }}
          </template>
          <template #arabic_name="{ item }">
            {{ item.arabic_name }}
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
              :confirm-message="`سيتم إيقاف هذا التشخيص مع الاحتفاظ به في ${item.usage_count || 0} زيارة سابقة. هل تريد المتابعة؟`"
              @edit="openFormModal(item)"
              @delete="handleDeleteDiagnosis(item.id)"
            >
              <BaseButton
                v-if="item.is_active === false"
                variant="ghost"
                size="xs"
                icon="rotate-left"
                title="إعادة التفعيل"
                @click.stop="handleReactivateDiagnosis(item.id)"
              />
            </TableActions>
          </template>
        </ListView>
      </div>
    </BaseCard>

    <BaseModal
      v-model="modalOpen"
      :title="isEditing ? 'تعديل التشخيص' : 'تشخيص جديد'"
      confirm-text="حفظ"
      size="sm"
      @confirm="handleSaveDiagnosis"
    >
      <div class="flex flex--column gap-3">
        <FormField
          label="الكود"
          field-id="diagCode"
          required
        >
          <input
            id="diagCode"
            v-model="form.code"
            class="form-control"
            placeholder="F32.9"
            required
          >
        </FormField>
        <FormField
          label="الاسم العلمي (إنجليزي)"
          field-id="diagEnglish"
          required
        >
          <input
            id="diagEnglish"
            v-model="form.english_name"
            class="form-control"
            required
          >
        </FormField>
        <FormField
          label="الاسم المعرّب"
          field-id="diagArabic"
          required
        >
          <input
            id="diagArabic"
            v-model="form.arabic_name"
            class="form-control"
            required
          >
        </FormField>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import BaseModal from '@/components/ui/BaseModal.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormField from '@/components/ui/FormField.vue'
import Icon from '@/components/ui/Icon.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useApi } from '@/composables/useApi'
import { useCopy } from '@/composables/useCopy'
import { useNotify } from '@/composables/useNotify'
import { useRouteQuery } from '@/composables/useRouteQuery'
import diagnosisService from '@/features/clinical/services/diagnosisService'
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
  code: '',
  english_name: '',
  arabic_name: '',
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
  { key: 'search', type: 'text', placeholder: 'ابحث بالكود أو الاسم' },
  { key: 'activity', type: 'select', placeholder: 'جميع الحالات', options: [
    { value: '', label: 'جميع الحالات' },
    { value: 'active', label: 'النشطة' },
    { value: 'inactive', label: 'المتقاعدة' },
  ] },
  { key: 'sort_by', type: 'select', placeholder: 'الفرز حسب', options: [
    { value: 'order', label: 'الترتيب المعتمد' },
    { value: 'code', label: 'الكود' },
    { value: 'english_name', label: 'الاسم الإنجليزي' },
    { value: 'arabic_name', label: 'الاسم العربي' },
    { value: 'usage_count', label: 'عدد الاستخدامات' },
  ] },
  { key: 'sort_order', type: 'select', placeholder: 'اتجاه الفرز', options: [
    { value: 'asc', label: 'تصاعدي' },
    { value: 'desc', label: 'تنازلي' },
  ] },
]

const columns = [
  { key: 'code', label: 'الكود' },
  { key: 'english_name', label: 'الإنجليزي' },
  { key: 'arabic_name', label: 'العربي' },
  { key: 'usage_count', label: 'عدد الاستخدامات' },
]

const fetchFn = makeCursorFetchFn(diagnosisService, {
  getParams: (values) => ({ ...values, include_inactive: true }),
})

function refreshList() {
  lookupStore.invalidateDiagnoses()
  refreshKey.value++
}

function copyItem(text) {
  if (text) copy(text)
}

function openFormModal(diagnosis) {
  if (diagnosis) {
    isEditing.value = true
    currentId.value = diagnosis.id

    form.value = {
      version: diagnosis.version,
      code: diagnosis.code || '',
      english_name: diagnosis.english_name || '',
      arabic_name: diagnosis.arabic_name || '',
    }
  } else {
    isEditing.value = false
    currentId.value = null

    form.value = {
      code: '',
      english_name: '',
      arabic_name: '',
    }
  }

  modalOpen.value = true
}

const { execute: execSave } = useApi(async () => {
  if (isEditing.value) {
    await diagnosisService.update(currentId.value, form.value)
  } else {
    await diagnosisService.create(form.value)
  }

  modalOpen.value = false
  refreshList()
})

const handleSaveDiagnosis = () => execSave()

const handleDeleteDiagnosis = async (id) => {
  try {
    await diagnosisService.delete(id)
  refreshList()
  } catch {
    notify('لا يمكن حذف هذا التشخيص', 'danger')
  }
}

const handleReactivateDiagnosis = async (id) => {
  await diagnosisService.reactivate(id)
  notify('تمت إعادة تفعيل التشخيص', 'success')
  refreshList()
}

function resetFilters() {
  filters.value = {}
}

const { execute: handleExportExcel } = useApi(async () => {
  const response = await diagnosisService.export(filters.value)
  downloadBlob(response, 'diagnoses.xlsx')
  notify('تم تنزيل التشخيصات الظاهرة حسب المرشحات', 'success')
})

</script>
