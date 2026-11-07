<!-- frontend/src/views/TemplatesList.vue -->
<template>
  <div class="templates-list">
    <Breadcrumb :items="[{ label: 'القوالب' }]" />

    <PageHeader title="قوالب الملاحظات السريرية">
      <BaseButton
        variant="primary"
        :to="{ name: 'TemplateCreate' }"
      >
        <Icon icon="plus" /> قالب جديد
      </BaseButton>
    </PageHeader>

    <BaseCard>
      <div class="card__body">
        <ListView
          :columns="columns"
          :fetch-fn="fetchFn"
          :filters="tableFilters"
          :filter-values="filters"
          :refresh-key="refreshKey"
          empty-title="لا توجد قوالب"
          empty-description="لا توجد قوالب تطابق معايير البحث."
          empty-action-text="قالب جديد"
          empty-action-url="/templates/new"
          @update:filter-values="filters = $event"
          @filter-reset="resetFilters"
        >
          <template #name="{ item }">
            {{ item.name }}
          </template>

          <template #category="{ item }">
            {{ item.category }}
          </template>

          <template #description="{ item }">
            {{ item.description }}
          </template>

          <template #status="{ item }">
            {{ item.is_active === false ? 'متقاعد' : 'نشط' }}
          </template>

          <template #actions="{ item }">
            <TableActions
              :edit-to="{ name: 'TemplateEdit', params: { id: item.id } }"
              :show-edit="item.is_active !== false"
              :show-delete="item.is_active !== false"
              :confirm-message="`سيتم إيقاف القالب للاستخدامات الجديدة مع الاحتفاظ بـ ${item.usage_count || 0} استخدام تاريخي. متابعة؟`"
              @delete="deleteTemplateItem(item)"
            >
              <BaseButton
                v-if="item.is_active === false"
                variant="ghost"
                size="xs"
                icon="rotate-left"
                title="إعادة التفعيل"
                @click.stop="reactivateTemplate(item)"
              />
            </TableActions>
          </template>
        </ListView>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useRouteQuery } from '@/composables/useRouteQuery'
import templateService from '@/features/clinical/services/templateService'
import { makeCursorFetchFn } from '@/utils/listFetch'

const columns = [
  { key: 'name', label: 'الاسم' },
  { key: 'category', label: 'التصنيف' },
  { key: 'description', label: 'الوصف' },
  { key: 'usage_count', label: 'عدد الاستخدامات' },
  { key: 'status', label: 'الحالة' },
]

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
    { value: 'category', label: 'التصنيف' },
    { value: 'updated_at', label: 'آخر تعديل' },
  ] },
  { key: 'sort_order', type: 'select', placeholder: 'اتجاه الفرز', options: [
    { value: 'asc', label: 'تصاعدي' },
    { value: 'desc', label: 'تنازلي' },
  ] },
]

const fetchFn = makeCursorFetchFn(templateService, {
  getParams: (values) => ({ ...values, include_inactive: true }),
})

async function deleteTemplateItem(template) {
  await templateService.delete(template.id)
  refreshKey.value++
}

async function reactivateTemplate(template) {
  await templateService.reactivate(template.id)
  refreshKey.value++
}

function resetFilters() {
  filters.value = {}
}
</script>
