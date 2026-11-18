<template>
  <PageContainer status="content">
    <PageHeader title="سجل التدقيق" subtitle="سجل الإجراءات المنفذة والمستخدم والتاريخ" />
    <ListView :columns="columns" :fetch-fn="fetchFn" :filters="filters" v-model:filter-values="filterValues" :date-fields="['date_from', 'date_to']">
      <template #created_at="{ item }"><DateCell :date="item.created_at" :relative="false" show-time /></template>
      <template #action="{ item }">{{ actionLabel(item.action) }}</template>
      <template #entity_type="{ item }">{{ entityLabel(item.entity_type) }}</template>
    </ListView>
  </PageContainer>
</template>
<script setup>
import { useRouteFilters } from '@/composables/useRouteFilters'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ListView from '@/components/ui/ListView.vue'
import DateCell from '@/components/ui/DateCell.vue'
import auditService from '@/features/settings/services/auditService'
import { makeCursorFetchFn } from '@/utils/listFetch'
const filterValues = useRouteFilters({ actor_id: '', entity_type: '', action: '', date_from: '', date_to: '' })
const columns = [{ key: 'created_at', label: 'التاريخ' }, { key: 'user_name', label: 'المستخدم' }, { key: 'action', label: 'الإجراء' }, { key: 'entity_type', label: 'نوع السجل' }, { key: 'entity_id', label: 'رقم السجل' }]
const filters = [{ key: 'actor_id', type: 'text', placeholder: 'رقم المستخدم' }, { key: 'entity_type', type: 'text', placeholder: 'نوع السجل' }, { key: 'action', type: 'text', placeholder: 'الإجراء' }, { key: 'date', type: 'date', placeholder: 'الفترة' }]
const fetchFn = makeCursorFetchFn(auditService, { getParams: values => ({ ...values }) })
const actionLabel = action => ({ create: 'إنشاء', update: 'تعديل', archive: 'أرشفة', restore: 'استعادة', login: 'تسجيل دخول', logout: 'تسجيل خروج', export: 'تصدير', backup: 'نسخ احتياطي', anonymize: 'تقييد الهوية', generate_prescription: 'إصدار وصفة', generate_referral: 'إصدار خطاب تحويل' }[action] || action)
const entityLabel = entity => ({ Patient: 'مريض', Visit: 'زيارة', Appointment: 'موعد', Invoice: 'فاتورة', User: 'مستخدم', System: 'النظام' }[entity] || entity)
</script>
