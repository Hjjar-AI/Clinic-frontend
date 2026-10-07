<!-- frontend/src/features/clinical/views/ScalesAdmin.vue -->
<template>
  <div class="scales-admin">
    <PageHeader title="المقاييس السريرية">
      <BaseButton
        variant="primary"
        @click="openCreateScaleModal"
      >
        <Icon icon="plus" /> مقياس جديد
      </BaseButton>
    </PageHeader>

    <BaseCard>
      <CardHeader
        variant="neutral"
        icon="chart-line"
        title="قائمة المقاييس"
      />
      <div class="card__body">
        <ListView
          :columns="scaleColumns"
          :fetch-fn="fetchFn"
          :filters="tableFilters"
          :filter-values="filters"
          :refresh-key="refreshKey"
          empty-title="لا توجد مقاييس"
          empty-description="اضغط 'مقياس جديد' للبدء"
          @update:filter-values="filters = $event"
          @filter-reset="resetFilters"
        >
          <template #name="{ item }">
            <strong>{{ item.name }}</strong>
          </template>
          <template #description="{ item }">
            {{ item.description }}
          </template>
          <template #fields="{ item }">
            {{ item.fields?.length || 0 }}
          </template>
          <template #usage_count="{ item }">
            {{ item.usage_count || 0 }}
          </template>
          <template #status="{ item }">
            <StatusCell
              :status="item.is_active !== false ? 'published' : 'draft'"
              status-type="scale"
              size="xs"
            />
          </template>
          <template #actions="{ item }">
            <BaseButton
              variant="secondary"
              size="xs"
              aria-label="إضافة سؤال"
              title="إضافة سؤال"
              @click="openAddFieldModal(item)"
            >
              <Icon icon="plus" />
            </BaseButton>
            <TableActions
              :show-view="false"
              :show-edit="false"
              :show-delete="item.is_active !== false"
              :confirm-message="`سيتم إيقاف المقياس مع حفظ ${item.usage_count || 0} استجابة تاريخية. متابعة؟`"
              @delete="deactivateScale(item.id)"
            >
              <BaseButton
                v-if="item.is_active === false"
                variant="ghost"
                size="xs"
                icon="rotate-left"
                title="إعادة التفعيل"
                @click.stop="reactivateScale(item.id)"
              />
            </TableActions>
          </template>
        </ListView>
      </div>
    </BaseCard>

    <BaseModal
      v-model="showCreateModal"
      title="مقياس جديد"
      confirm-text="إنشاء"
      size="sm"
      @confirm="createScale"
    >
      <FormField
        label="الاسم"
        required
      >
        <input
          v-model="newScale.name"
          class="form-control"
          required
        >
      </FormField>
      <FormField label="الوصف">
        <textarea
          v-model="newScale.description"
          class="form-control form-control--textarea"
        />
      </FormField>
    </BaseModal>

    <BaseModal
      v-model="showFieldModal"
      :title="'إضافة سؤال إلى ' + (selectedScale?.name || '')"
      confirm-text="إضافة"
      size="sm"
      @confirm="saveField"
    >
      <FormField
        label="السؤال"
        required
      >
        <input
          v-model="newField.label"
          class="form-control"
          required
        >
      </FormField>
      <FormField label="النوع">
        <select
          v-model="newField.field_type"
          class="form-control form-control--select"
        >
          <option value="slider">
            شريط تمرير
          </option>
          <option value="text">
            نص
          </option>
        </select>
      </FormField>
      <template v-if="newField.field_type === 'slider'">
        <FormField label="الحد الأدنى">
          <input
            v-model.number="newField.min_val"
            type="number"
            class="form-control"
          >
        </FormField>
        <FormField label="الحد الأقصى">
          <input
            v-model.number="newField.max_val"
            type="number"
            class="form-control"
          >
        </FormField>
        <FormField label="الخطوة">
          <input
            v-model.number="newField.step"
            type="number"
            class="form-control"
          >
        </FormField>
        <FormField label="القيمة الافتراضية">
          <input
            v-model.number="newField.default"
            type="number"
            class="form-control"
          >
        </FormField>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import BaseModal from '@/components/ui/BaseModal.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import FormField from '@/components/ui/FormField.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusCell from '@/components/ui/StatusCell.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useApi } from '@/composables/useApi'
import { useRouteQuery } from '@/composables/useRouteQuery'
import scaleService from '@/features/clinical/services/scaleService'
import { makeCursorFetchFn } from '@/utils/listFetch'

const showCreateModal = ref(false)
const showFieldModal = ref(false)

const selectedScale = ref(null)

const newScale = ref({
  name: '',
  description: '',
})

const newField = ref({
  label: '',
  field_type: 'slider',
  min_val: 0,
  max_val: 10,
  step: 1,
  default: 0,
  options: '',
})

const refreshKey = ref(0)
const searchQuery = useRouteQuery('search', '')
const activityQuery = useRouteQuery('activity', '')
const sortByQuery = useRouteQuery('sort_by', 'name')
const sortOrderQuery = useRouteQuery('sort_order', 'asc')

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
    sortByQuery.value = value.sort_by || 'name'
    sortOrderQuery.value = value.sort_order || 'asc'
  },
})

const tableFilters = [
  { key: 'search', type: 'text', placeholder: 'ابحث بالاسم أو الوصف' },
  { key: 'activity', type: 'select', placeholder: 'جميع الحالات', options: [
    { value: '', label: 'جميع الحالات' },
    { value: 'active', label: 'النشطة' },
    { value: 'inactive', label: 'المتقاعدة' },
  ] },
  { key: 'sort_by', type: 'select', placeholder: 'الفرز حسب', options: [
    { value: 'name', label: 'الاسم' },
    { value: 'usage_count', label: 'عدد الاستخدامات' },
    { value: 'updated_at', label: 'آخر تعديل' },
  ] },
  { key: 'sort_order', type: 'select', placeholder: 'اتجاه الفرز', options: [
    { value: 'asc', label: 'تصاعدي' },
    { value: 'desc', label: 'تنازلي' },
  ] },
]

const scaleColumns = [
  { key: 'name', label: 'الاسم' },
  { key: 'description', label: 'الوصف' },
  { key: 'fields', label: 'عدد الأسئلة' },
  { key: 'usage_count', label: 'عدد الاستخدامات' },
  { key: 'status', label: 'الحالة' },
]

const fetchFn = makeCursorFetchFn(scaleService, {
  getParams: (values) => ({ ...values, include_inactive: true }),
})

function openCreateScaleModal() {
  newScale.value = {
    name: '',
    description: '',
  }

  showCreateModal.value = true
}

const { execute: doCreate } = useApi(async () => {
  await scaleService.create(newScale.value)

  showCreateModal.value = false

  newScale.value = {
    name: '',
    description: '',
  }

  refreshKey.value++
})

const createScale = () => doCreate()

function openAddFieldModal(scale) {
  selectedScale.value = scale

  newField.value = {
    label: '',
    field_type: 'slider',
    min_val: 0,
    max_val: 10,
    step: 1,
    default: 0,
    options: '',
  }

  showFieldModal.value = true
}

const { execute: doAddField } = useApi(async () => {
  const payload = {
    label: newField.value.label,
    field_type: newField.value.field_type,
    min_val: newField.value.min_val,
    max_val: newField.value.max_val,
    step: newField.value.step,
    default: newField.value.default,
    options: newField.value.options,
  }

  await scaleService.addField(selectedScale.value.id, payload)

  showFieldModal.value = false

  newField.value = {
    label: '',
    field_type: 'slider',
    min_val: 0,
    max_val: 10,
    step: 1,
    default: 0,
    options: '',
  }

  refreshKey.value++
})

const saveField = () => doAddField()

async function deactivateScale(id) {
  await scaleService.delete(id)
  refreshKey.value++
}

async function reactivateScale(id) {
  await scaleService.reactivate(id)
  refreshKey.value++
}

function resetFilters() {
  filters.value = {}
}
</script>
