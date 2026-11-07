<!-- frontend/src/features/billing/views/InvoicesList.vue -->
<template>
  <div class="invoices-list-view">
    <Breadcrumb :items="[{ label: 'الفواتير' }]" />

    <PageHeader
      title="السجلات المالية"
      subtitle="استعراض وتتبع كافة المعاملات المالية."
    >
      <BaseButton
        v-if="authStore.can('manage_billing')"
        variant="primary"
        :to="{ name: 'InvoiceCreate' }"
      >
        <Icon icon="plus" /> فاتورة جديدة
      </BaseButton>
    </PageHeader>

    <BaseCard>
      <ListView
        :columns="columns"
        :fetch-fn="fetchFn"
        :filters="tableFilters"
        :filter-values="filters"
        empty-title="لا توجد فواتير"
        empty-action-text="فاتورة جديدة"
        :empty-action-url="
          authStore.can('manage_billing') ? '/invoices/new' : null
        "
        :date-fields="['date_from', 'date_to']"
        :refresh-key="refreshKey"
        @update:filter-values="filters = $event"
        @filter-apply="refreshAll"
        @filter-reset="confirmResetFilters"
      >
        <template #invoice_number="{ item }">
          <span class="font-semibold text-primary">#{{ item.invoice_number }}</span>
        </template>

        <template #patient_name="{ item }">
          {{ item.patient_name }}
        </template>

        <template #final_amount="{ item }">
          <span class="font-bold text-success">
            {{ formatMoney(item.final_amount, item.currency || 'SYP') }}
          </span>
        </template>

        <template #status="{ item }">
          <StatusCell
            :status="item.is_overdue ? 'overdue' : item.status"
            status-type="invoice"
            size="xs"
          />
        </template>

        <template #issued_date="{ item }">
          <DateCell :date="item.issued_date" />
        </template>

        <template #actions="{ item }">
          <TableActions
            :show-edit="
              authStore.can('manage_billing') && item.status === 'draft'
            "
            :show-delete="false"
            :edit-to="{ name: 'InvoiceEdit', params: { id: item.id } }"
            :show-view="false"
          >
            <BaseButton
              v-if="authStore.can('manage_billing') && item.status === 'draft'"
              size="xs"
              variant="primary"
              confirm-message="إصدار الفاتورة سيمنع تعديل المبالغ. هل تريد المتابعة؟"
              @confirmed="transitionInvoice(item, 'issued')"
            >
              إصدار
            </BaseButton>
            <BaseButton
              v-if="authStore.can('manage_billing') && item.status === 'issued'"
              size="xs"
              variant="success"
              confirm-message="تأكيد استلام الدفعة؟"
              @confirmed="transitionInvoice(item, 'paid')"
            >
              دفع
            </BaseButton>
            <BaseButton
              v-if="
                authStore.can('manage_billing') &&
                  ['draft', 'issued'].includes(item.status)
              "
              size="xs"
              variant="danger"
              @click="cancelInvoice(item)"
            >
              إلغاء
            </BaseButton>
            <BaseButton
              v-if="item.status !== 'draft'"
              size="xs"
              variant="ghost"
              icon="file-pdf"
              title="تنزيل PDF"
              @click.stop="downloadInvoice(item)"
            />
          </TableActions>
        </template>
      </ListView>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DateCell from '@/components/ui/DateCell.vue'
import ListView from '@/components/ui/ListView.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusCell from '@/components/ui/StatusCell.vue'
import TableActions from '@/components/ui/TableActions.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useFormatters } from '@/composables/useFormatters'
import { useRouteFilters } from '@/composables/useRouteFilters'
import { statusPresentation } from '@/constants/statusPresentation'
import { useAuthStore } from '@/features/auth/stores/auth'
import invoiceService from '@/features/billing/services/invoiceService'
import { CONFIRM } from '@/utils/confirmMessages'
import { downloadBlob } from '@/utils/download'
import { makeCursorFetchFn } from '@/utils/listFetch'

const { formatMoney } = useFormatters()
const authStore = useAuthStore()
const { confirm, prompt } = useConfirmDialog()
const refreshKey = ref(0)

const filters = useRouteFilters({
  search: '',
  status: '',
  date_from: '',
  date_to: '',
  sort_by: 'issued_date',
  sort_order: 'desc',
})

const columns = [
  { key: 'invoice_number', label: 'رقم الفاتورة' },
  { key: 'patient_name', label: 'المريض' },
  { key: 'final_amount', label: 'المبلغ' },
  { key: 'status', label: 'الحالة' },
  { key: 'issued_date', label: 'تاريخ الإصدار' },
]

const tableFilters = computed(() => [
  {
    key: 'search',
    type: 'text',
    placeholder: 'رقم الفاتورة أو اسم المريض',
  },
  {
    key: 'status',
    type: 'status',
    placeholder: 'جميع الحالات',
    options: [
      { value: '', label: 'جميع الحالات' },
      ...['draft', 'issued', 'paid', 'cancelled', 'overdue'].map((value) => ({
        value,
        label: statusPresentation('invoice', value).label,
      })),
    ],
  },
  {
    key: 'date',
    type: 'date',
    placeholder: 'تاريخ الإصدار',
  },
  {
    key: 'sort_by',
    type: 'select',
    placeholder: 'الفرز حسب',
    options: [
      { value: 'issued_date', label: 'تاريخ الإصدار' },
      { value: 'invoice_number', label: 'رقم الفاتورة' },
      { value: 'patient', label: 'المريض' },
      { value: 'amount', label: 'المبلغ' },
      { value: 'status', label: 'الحالة' },
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

const fetchFn = makeCursorFetchFn(invoiceService, {
  getParams: (f) => ({
    search: f?.search || undefined,
    status: f?.status || undefined,
    date_from: f?.date_from || undefined,
    date_to: f?.date_to || undefined,
    sort_by: f?.sort_by || undefined,
    sort_order: f?.sort_order || undefined,
  }),
})

function refreshAll() {
  refreshKey.value += 1
}

async function transitionInvoice(invoice, status, reason = '') {
  await invoiceService.transition(invoice.id, status, invoice.version, reason)
  refreshAll()
}

async function cancelInvoice(invoice) {
  const reason = await prompt(
    'ستبقى الفاتورة في السجل بحالة ملغية ولن تدخل في الإجماليات.',
    {
      title: 'إلغاء الفاتورة',
      confirmText: 'إلغاء الفاتورة',
      inputLabel: 'سبب الإلغاء',
    },
  )
  if (!reason) return
  await transitionInvoice(invoice, 'cancelled', reason)
}

async function downloadInvoice(invoice) {
  const response = await invoiceService.exportPdf(invoice.id)
  downloadBlob(response.data, `invoice_${invoice.invoice_number}.pdf`)
}

async function confirmResetFilters() {
  const ok = await confirm(CONFIRM.CLEAR_FILTERS)

  if (ok) {
    filters.value = {}
  }
}
</script>
