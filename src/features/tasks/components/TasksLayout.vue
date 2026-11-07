<template>
  <PageContainer status="content" class="tasks-page">
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
        <div class="task-add-row flex gap-3 flex--end">
          <FormInput v-model="newTaskTitle" label="عنوان المهمة" required class="flex--1" placeholder="عنوان..." />
          <FormInput v-model="newTaskDueDate" type="date" label="تاريخ الاستحقاق" />
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
        :refresh-key="refreshKey"
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
          <Badge :status="item.status" status-type="task" />
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
            title="حذف"
            @click="$emit('delete-task', item)"
          />
        </template>
      </ListView>
    </BaseCard>
  </PageContainer>
</template>

<script setup>
import { ref } from 'vue'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DateCell from '@/components/ui/DateCell.vue'
import FormInput from '@/components/ui/FormInput.vue'
import Badge from '@/components/ui/Badge.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

defineProps({
  showAddForm: { type: Boolean, default: false },
  adding: { type: Boolean, default: false },
  columns: { type: Array, required: true },
  taskFilters: { type: Array, required: true },
  filters: { type: Object, required: true },
  fetchFn: { type: Function, required: true },
  refreshKey: { type: Number, default: 0 },
})

defineEmits([
  'toggle-add-form', 'add-task', 'update:filters',
  'filter-apply', 'filter-reset', 'complete-task', 'start-task', 'cancel-task',
  'reopen-task', 'delete-task'
])

const newTaskTitle = ref('')
const newTaskDueDate = ref('')

</script>

<style scoped src="../../../styles/features/tasks/components/tasks-layout.css"></style>
