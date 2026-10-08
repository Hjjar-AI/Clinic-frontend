<template>
  <div class="tasks-page">
    <Breadcrumb />
    <PageHeader
      title="إدارة المهام"
      subtitle="تنظيم ومتابعة الواجبات الإدارية والسريرية."
    >
      <BaseButton
        variant="primary"
        @click="$emit('toggle-add-form')"
      >
        <Icon icon="plus" /> {{ showAddForm ? 'إغلاق' : 'مهمة جديدة' }}
      </BaseButton>
    </PageHeader>

    <div
      v-if="showAddForm"
      class="card mb-4 p-3"
    >
      <form @submit.prevent="$emit('add-task', newTaskTitle, newTaskDueDate)">
        <div class="flex gap-3 flex--end">
          <FormField
            label="عنوان المهمة"
            required
            class="flex--1"
          >
            <input
              v-model="newTaskTitle"
              class="form-control"
              required
              placeholder="عنوان..."
            >
          </FormField>
          <FormField label="تاريخ الاستحقاق">
            <input
              v-model="newTaskDueDate"
              type="date"
              class="form-control"
            >
          </FormField>
          <BaseButton
            type="submit"
            variant="success"
            :loading="adding"
          >
            حفظ
          </BaseButton>
        </div>
      </form>
    </div>

    <BaseCard>
      <ListView
        :columns="columns"
        :fetch-fn="fetchFn"
        :filters="taskFilters"
        :filter-values="filters"
        empty-title="لا توجد مهام"
        empty-description="كل المهام مكتملة"
        empty-action-text="أضف مهمة جديدة"
        @update:filter-values="$emit('update:filters', $event)"
        @filter-apply="$emit('filter-apply')"
        @filter-reset="$emit('filter-reset')"
      >
        <template #title="{ item }">
          <span
            :class="{ 'text-muted line-through': item.status === 'completed' }"
            :title="item.description || item.title"
          >
            {{ item.title }}
          </span>
        </template>
        <template #due_date="{ item }">
          <DateCell
            :date="item.due_date"
            :class="{ 'text-danger font-semibold': item.is_overdue }"
          />
        </template>
        <template #status="{ item }">
          <span
            class="tag"
            :class="statusTagClass(item.status)"
          >{{ statusLabel(item.status) }}</span>
        </template>
        <template #actions="{ item }">
          <BaseButton
            v-if="['open', 'in_progress'].includes(item.status)"
            size="xs"
            icon="check"
            title="إكمال"
            @click="$emit('complete-task', item)"
          />
          <BaseButton
            v-if="item.status === 'open'"
            size="xs"
            variant="secondary"
            title="بدء التنفيذ"
            @click="$emit('start-task', item)"
          />
          <BaseButton
            v-if="['open', 'in_progress'].includes(item.status)"
            size="xs"
            variant="danger"
            icon="ban"
            title="إلغاء"
            @click="$emit('cancel-task', item)"
          />
          <BaseButton
            v-if="['completed', 'cancelled'].includes(item.status)"
            size="xs"
            variant="secondary"
            icon="rotate-left"
            title="إعادة الفتح"
            @click="$emit('reopen-task', item)"
          />
          <BaseButton
            size="xs"
            variant="ghost"
            icon="trash"
            :disabled="!['completed', 'cancelled'].includes(item.status)"
            :confirm-message="CONFIRM.DELETE_WITH_NAME(item.title)"
            :confirm-checkbox="true"
            title="حذف"
            @confirmed="$emit('delete-task', item)"
          />
        </template>
      </ListView>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DateCell from '@/components/ui/DateCell.vue'
import FormField from '@/components/ui/FormField.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { CONFIRM } from '@/utils/confirmMessages'

defineProps({
  showAddForm: { type: Boolean, default: false },
  adding: { type: Boolean, default: false },
  columns: { type: Array, required: true },
  taskFilters: { type: Array, required: true },
  filters: { type: Object, required: true },
  fetchFn: { type: Function, required: true },
})

defineEmits([
  'toggle-add-form', 'add-task', 'update:filters',
  'filter-apply', 'filter-reset', 'complete-task', 'start-task', 'cancel-task',
  'reopen-task', 'delete-task'
])

const newTaskTitle = ref('')
const newTaskDueDate = ref('')

function statusTagClass(status) {
  return status === 'open' ? 'tag--warning-soft' : status === 'in_progress' ? 'tag--info-soft' : status === 'completed' ? 'tag--success-soft' : 'tag--danger-soft'
}
function statusLabel(status) {
  return status === 'open' ? 'مفتوحة' : status === 'in_progress' ? 'قيد التنفيذ' : status === 'completed' ? 'مكتملة' : 'ملغية'
}
</script>

<style scoped src="../../../styles/features/tasks/components/tasks-layout.css"></style>
