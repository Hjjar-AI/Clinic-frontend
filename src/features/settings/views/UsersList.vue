<!-- frontend/src/views/UsersList.vue -->
<template>
  <div class="users-list-view">
    <Breadcrumb :items="[{ label: 'المستخدمين' }]" />

    <PageHeader title="إدارة المستخدمين">
      <BaseButton
        variant="primary"
        :to="{ name: 'UserCreate' }"
      >
        <Icon icon="plus" /> مستخدم جديد
      </BaseButton>
    </PageHeader>

    <BaseCard>
      <ListView
        :columns="columns"
        :fetch-fn="fetchFn"
        :filters="tableFilters"
        :filter-values="filters"
        empty-title="لا يوجد مستخدمين"
        empty-action-text="مستخدم جديد"
        empty-action-url="/users/new"
        :refresh-key="refreshKey"
        @update:filter-values="filters = $event"
        @filter-reset="resetFilters"
      >
        <template #username="{ item }">
          <span class="font-semibold">@{{ item.username }}</span>
        </template>

        <template #full_name="{ item }">
          {{ item.full_name }}
        </template>

        <template #role="{ item }">
          <StatusCell
            :status="item.role"
            status-type="user"
            size="xs"
          />
        </template>

        <template #permissions="{ item }">
          <BaseButton
            variant="secondary"
            size="sm"
            :to="{ name: 'UserPermissions', params: { id: item.id } }"
          >
            صلاحيات
          </BaseButton>
        </template>

        <template #actions="{ item }">
          <TableActions
            :edit-to="{ name: 'UserEdit', params: { id: item.id } }"
            confirm-message="سيتم تعطيل الحساب وإبطال جلساته مع الاحتفاظ بملكيته التاريخية للسجلات. هل تريد المتابعة؟"
            @delete="deleteUserItem(item)"
          >
            <BaseButton
              variant="secondary"
              size="sm"
              :to="{ name: 'UserPermissions', params: { id: item.id } }"
            >
              صلاحيات
            </BaseButton>
          </TableActions>
        </template>
      </ListView>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusCell from '@/components/ui/StatusCell.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useApi } from '@/composables/useApi'
import { useRouteQuery } from '@/composables/useRouteQuery'
import userService from '@/features/settings/services/userService'
import { makeCursorFetchFn } from '@/utils/listFetch'

const columns = [
  { key: 'username', label: 'اسم المستخدم' },
  { key: 'full_name', label: 'الاسم الكامل' },
  { key: 'role', label: 'الدور' },
  { key: 'permissions', label: 'الصلاحيات' },
]

const refreshKey = ref(0)

const searchQuery = useRouteQuery('search', '')
const roleQuery = useRouteQuery('role', '')
const sortByQuery = useRouteQuery('sort_by', 'username')
const sortOrderQuery = useRouteQuery('sort_order', 'asc')

const filters = computed({
  get: () => ({
    search: searchQuery.value,
    role: roleQuery.value,
    sort_by: sortByQuery.value,
    sort_order: sortOrderQuery.value,
  }),
  set: (value) => {
    searchQuery.value = value.search || ''
    roleQuery.value = value.role || ''
    sortByQuery.value = value.sort_by || 'username'
    sortOrderQuery.value = value.sort_order || 'asc'
  },
})

const tableFilters = [
  { key: 'search', type: 'text', placeholder: 'اسم المستخدم أو الاسم الكامل' },
  {
    key: 'role', type: 'select', placeholder: 'كل الأدوار', options: [
      { value: 'admin', label: 'مدير' },
      { value: 'doctor', label: 'طبيب' },
      { value: 'receptionist', label: 'موظف استقبال' },
    ],
  },
  {
    key: 'sort_by', type: 'select', placeholder: 'الفرز حسب', options: [
      { value: 'username', label: 'اسم المستخدم' },
      { value: 'full_name', label: 'الاسم الكامل' },
      { value: 'role', label: 'الدور' },
      { value: 'date_joined', label: 'تاريخ الإنشاء' },
    ],
  },
  {
    key: 'sort_order', type: 'select', placeholder: 'اتجاه الفرز', options: [
      { value: 'asc', label: 'تصاعدي' },
      { value: 'desc', label: 'تنازلي' },
    ],
  },
]

const fetchFn = makeCursorFetchFn(userService, {
  getParams: (values) => ({ ...values }),
})

const { execute: doDelete } = useApi((id) => userService.delete(id))

async function deleteUserItem(user) {
  await doDelete(user.id)
  // The backend deactivates rather than physically deleting the account so
  // historical visits, tasks, and audit ownership remain readable.
  refreshKey.value++  // trigger list refresh
}

function resetFilters() {
  searchQuery.value = ''
  roleQuery.value = ''
  sortByQuery.value = 'username'
  sortOrderQuery.value = 'asc'
}
</script>
