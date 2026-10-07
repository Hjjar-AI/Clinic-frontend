<!-- frontend/src/features/tasks/views/TasksPage.vue -->
<template>
  <TasksLayout
    :show-add-form="showAddForm"
    :adding="adding"
    :columns="columns"
    :task-filters="taskFilters"
    :filters="filters"
    :fetch-fn="(args) => taskStore.fetchTasks(args)"
    @toggle-add-form="showAddForm = !showAddForm"
    @add-task="handleAdd"
    @update:filters="filters = $event"
    @filter-apply="refreshData"
    @filter-reset="confirmResetFilters"
    @complete-task="handleComplete"
    @start-task="handleStart"
    @cancel-task="handleCancel"
    @reopen-task="handleReopen"
    @delete-task="handleDelete"
  />
</template>

<script setup>
import { computed,ref } from 'vue'

import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useNotify } from '@/composables/useNotify'
import { useRouteQuery } from '@/composables/useRouteQuery'
import TasksLayout from '@/features/tasks/components/TasksLayout.vue'
import { useTaskStore } from '@/features/tasks/stores/tasks'
import { CONFIRM } from '@/utils/confirmMessages'

const taskStore = useTaskStore()

const { confirm, prompt } = useConfirmDialog()
const { notify } = useNotify()

const showAddForm = ref(false)
const adding = ref(false)

const statusFilter = useRouteQuery('status', '')
const assignedFilter = useRouteQuery('assigned', '')
const searchFilter = useRouteQuery('search', '')
const sortByFilter = useRouteQuery('sort_by', 'order')
const sortOrderFilter = useRouteQuery('sort_order', 'asc')

const filters = computed({
  get: () => ({
    search: searchFilter.value,
    status: statusFilter.value,
    assigned_to: assignedFilter.value,
    sort_by: sortByFilter.value,
    sort_order: sortOrderFilter.value,
  }),
  set: (value) => {
    searchFilter.value = value.search || ''
    statusFilter.value = value.status || ''
    assignedFilter.value = value.assigned_to || ''
    sortByFilter.value = value.sort_by || 'order'
    sortOrderFilter.value = value.sort_order || 'asc'
  },
})

const columns = [
  { key: 'title', label: 'المهمة' },
  { key: 'due_date', label: 'تاريخ الاستحقاق' },
  { key: 'status', label: 'الحالة' },
]

const taskFilters = computed(() => [
  {
    key: 'search',
    type: 'text',
    placeholder: 'ابحث في عنوان المهمة أو وصفها',
  },
  {
    key: 'status',
    type: 'status',
    placeholder: 'جميع الحالات',
    options: [
      { value: '', label: 'جميع الحالات' },
      { value: 'open', label: 'مفتوحة' },
      { value: 'in_progress', label: 'قيد التنفيذ' },
      { value: 'completed', label: 'مكتملة' },
      { value: 'cancelled', label: 'ملغية' },
    ],
  },
  {
    key: 'assigned_to',
    type: 'select',
    placeholder: 'جميع المستخدمين',
    options: [
      { value: '', label: 'جميع المستخدمين' },
      { value: 'unassigned', label: 'غير معين' },
    ],
  },
  {
    key: 'sort_by',
    type: 'select',
    placeholder: 'الفرز حسب',
    options: [
      { value: 'order', label: 'الترتيب اليدوي' },
      { value: 'due_date', label: 'تاريخ الاستحقاق' },
      { value: 'priority', label: 'الأولوية' },
      { value: 'status', label: 'الحالة' },
      { value: 'created_at', label: 'تاريخ الإنشاء' },
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

function refreshData() {
  // ListView automatically refreshes when filters change.
}

async function handleAdd(title, dueDate) {
  if (!title.trim()) return

  adding.value = true

  try {
    await taskStore.createTask({
      title,
      due_date: dueDate,
    })

    showAddForm.value = false
    notify('تم إضافة المهمة', 'success')
  } catch {
    notify('فشل إنشاء المهمة', 'danger')
  } finally {
    adding.value = false
  }
}

async function handleComplete(task) {
  try {
    await taskStore.completeTask(task.id, task.version)
    notify('تم إكمال المهمة', 'success')
  } catch {
    notify('فشل إكمال المهمة', 'danger')
  }
}

async function handleStart(task) {
  try {
    await taskStore.transitionTask(task.id, 'in_progress', task.version)
    notify('تم بدء تنفيذ المهمة', 'success')
  } catch {
    // Shared API handling shows the backend error.
  }
}

async function handleCancel(task) {
  const reason = await prompt('إلغاء المهمة يوقف تذكيراتها ويحفظ السبب في سجل التدقيق.', {
    title: 'إلغاء المهمة',
    confirmText: 'إلغاء المهمة',
    inputLabel: 'سبب الإلغاء',
  })
  if (!reason) return
  await taskStore.transitionTask(task.id, 'cancelled', task.version, reason)
  notify('تم إلغاء المهمة', 'success')
}

async function handleReopen(task) {
  await taskStore.transitionTask(task.id, 'open', task.version)
  notify('تمت إعادة فتح المهمة', 'success')
}

async function handleDelete(task) {
  const ok = await confirm(
    CONFIRM.DELETE_WITH_NAME(task.title),
    {
      confirmText: 'نعم، احذف',
      cancelText: 'إلغاء',
    }
  )

  if (!ok) return

  try {
    await taskStore.deleteTask(task.id)
    notify('تم حذف المهمة', 'success')
  } catch {
    notify('فشل حذف المهمة', 'danger')
  }
}

async function confirmResetFilters() {
  const ok = await confirm(CONFIRM.CLEAR_FILTERS)

  if (ok) {
    statusFilter.value = ''
    assignedFilter.value = ''
    searchFilter.value = ''
    sortByFilter.value = 'order'
    sortOrderFilter.value = 'asc'
  }
}
</script>
