<template>
  <div class="visits-list-view">
    <Breadcrumb />
    <PageHeader
      title="سجل الزيارات الطبية"
      subtitle="استعراض كافة الزيارات المسجلة."
    />

    <BaseCard>
      <ListView
        :columns="columns"
        :fetch-fn="fetchFn"
        :filters="tableFilters"
        :filter-values="filters"
        empty-title="لا توجد زيارات"
        empty-description="لم تُسجَّل أي زيارة بعد."
        :date-fields="['date_from', 'date_to']"
        @update:filter-values="$emit('update:filters', $event)"
        @filter-apply="$emit('filter-apply')"
        @filter-reset="$emit('filter-reset')"
      >
        <template #patient_name="{ item }">
          <router-link
            :to="{ name: 'PatientDetail', params: { id: item.patient_id } }"
            class="text-primary font-semibold"
          >
            {{ item.patient?.full_name || item.patient_name }}
          </router-link>
        </template>
        <template #visit_date="{ item }">
          <DateCell :date="item.visit_date" />
        </template>
        <template #main_complaints="{ item }">
          <span
            class="text-truncate"
            style="max-width: 250px;"
          >{{ item.main_complaints || '-' }}</span>
        </template>
        <template #status="{ item }">
          <StatusCell
            :status="item.status"
            status-type="visit"
            size="xs"
          />
        </template>
        <template #actions="{ item }">
          <TableActions
            :show-view="true"
            :view-to="{ name: 'VisitDetail', params: { id: item.id } }"
            :show-edit="canEdit && ['draft', 'amended'].includes(item.status)"
            :edit-to="{ name: 'VisitEdit', params: { id: item.id } }"
            :show-delete="canDelete && item.status === 'draft'"
            confirm-message="سيتم أرشفة مسودة الزيارة. يمكن لمسؤول النظام استعادتها من النسخة الاحتياطية عند الحاجة. هل تريد المتابعة؟"
            @delete="$emit('delete-visit', item)"
          >
            <BaseButton
              v-if="canExport"
              variant="ghost"
              size="xs"
              icon="file-pdf"
              title="PDF"
              @click.stop="$emit('export-pdf', item.id)"
            />
          </TableActions>
        </template>
      </ListView>
    </BaseCard>
  </div>
</template>

<script setup>
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DateCell from '@/components/ui/DateCell.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusCell from '@/components/ui/StatusCell.vue'
import TableActions from '@/components/ui/TableActions.vue'

defineProps({
  columns: { type: Array, required: true },
  fetchFn: { type: Function, required: true },
  tableFilters: { type: Array, required: true },
  filters: { type: Object, required: true },
  canDelete: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
})

defineEmits(['update:filters', 'filter-apply', 'filter-reset', 'delete-visit', 'export-pdf'])
</script>
