<!-- frontend/src/features/billing/views/InvoiceForm.vue -->
<template>
  <FormWrapper
    :header-title="isEdit ? 'تحديث الفاتورة' : 'فاتورة جديدة'"
    header-icon="file-invoice"
    back-label="العودة للفواتير"
    :submitting="saving"
    submit-text="حفظ الفاتورة"
    :cancel-to="{ name: 'InvoicesList' }"
    :validation-errors="errors"
    :submit-error="submitError"
    @submit="handleSubmit"
  >
    <template #headerTitle>
      <Breadcrumb :items="breadcrumbs" />
    </template>

    <div class="grid-2 gap-3">
      <ApiSelect
        v-model="form.patient_id"
        url="/patients/all_light/"
        value-key="id"
        :label-fn="patientLabel"
        label="المريض"
        required
        :error="errors.patient_id"
      />
      <FormInput
        v-model.number="form.total_amount"
        label="المبلغ الإجمالي"
        type="number"
        step="0.01"
        required
        :error="errors.total_amount"
      />
      <FormInput
        v-model.number="form.tax"
        label="الضريبة"
        type="number"
        step="0.01"
        :error="errors.tax"
      />
      <FormInput
        v-model.number="form.discount"
        label="الخصم"
        type="number"
        step="0.01"
        :error="errors.discount"
      />
      <FormInput
        v-model.number="form.final_amount"
        label="المبلغ النهائي (محسوب تلقائياً)"
        type="number"
        step="0.01"
        required
        disabled
        :error="errors.final_amount"
      />
      <FormSelect
        v-model="form.payment_method"
        label="طريقة الدفع"
        :options="paymentOptions"
      />
      <FormDate
        v-model="form.issued_date"
        label="تاريخ الإصدار"
        required
        :error="errors.issued_date"
      />
      <FormDate
        v-model="form.due_date"
        label="تاريخ الاستحقاق"
      />
      <ApiSelect
        v-if="form.patient_id"
        v-model="form.visit_id"
        :url="visitsUrl"
        value-key="id"
        :label-fn="visitLabel"
        label="الزيارة المرتبطة (اختياري)"
      />
    </div>
    <FormTextarea
      v-model="form.notes"
      label="ملاحظات"
      rows="3"
      class="mt-3"
    />
    <KeyValueList
      class="mt-4"
      :items="summaryLines"
    />
  </FormWrapper>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ApiSelect from '@/components/ui/ApiSelect.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormDate from '@/components/ui/FormDate.vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import FormTextarea from '@/components/ui/FormTextarea.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import KeyValueList from '@/components/ui/KeyValueList.vue'
import { useApi } from '@/composables/useApi'
import { useDate } from '@/composables/useDate'
import { useForm } from '@/composables/useForm'
import { useFormatters } from '@/composables/useFormatters'
import { useFormDirty } from '@/composables/useFormDirty'
import { useFormSubmission } from '@/composables/useFormSubmission'
import invoiceService from '@/features/billing/services/invoiceService'
import { unwrapResponse } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()

const { formatDate, normalizeFormDates } = useDate()
const { formatMoney } = useFormatters()

const isEdit = !!route.params.id

const paymentOptions = [
  { value: 'cash', label: 'نقدي' },
  { value: 'card', label: 'بطاقة' },
  { value: 'bank_transfer', label: 'تحويل' },
]

const initialData = {
  patient_id: '',
  visit_id: '',
  total_amount: 0,
  tax: 0,
  discount: 0,
  final_amount: 0,
  status: 'draft',
  payment_method: 'cash',
  issued_date: formatDate(new Date()),
  due_date: '',
  notes: '',
  version: 1,
}

const schema = [
  { field: 'patient_id', label: 'المريض', required: true },
  { field: 'total_amount', label: 'المبلغ الإجمالي', required: true, min: 0 },
  { field: 'tax', label: 'الضريبة', min: 0 },
  { field: 'discount', label: 'الخصم', min: 0 },
  { field: 'final_amount', label: 'المبلغ النهائي', required: true, min: 0 },
  { field: 'issued_date', label: 'تاريخ الإصدار', required: true },
]

const { form, errors, isDirty, validate, markClean } = useForm(initialData, { schema })

// Single source of truth: the ref returned by useForm.
useFormDirty(isDirty)

const visitsUrl = computed(() => {
  return form.patient_id
    ? `/billing/visits_for_patient?patient_id=${form.patient_id}`
    : ''
})

const { execute: execSubmit } = useApi(
  async () => {
    const payload = normalizeFormDates(form, ['issued_date', 'due_date'])
    payload.visit_id = form.visit_id || null

    if (isEdit) {
      await invoiceService.update(route.params.id, payload)
    } else {
      await invoiceService.create(payload)
    }

    router.push({ name: 'InvoicesList' })
  },
  { silent: true }
)

const { submit, submitError, isSubmitting: saving } = useFormSubmission(validate, execSubmit)

watch(
  () => [form.total_amount, form.tax, form.discount],
  ([total, tax, discount]) => {
    form.final_amount = Math.max(
      0,
      Number(total || 0) + Number(tax || 0) - Number(discount || 0)
    )
  },
  { immediate: true }
)

const summaryLines = computed(() => [
  { label: 'الإجمالي', value: formatMoney(form.total_amount || 0) },
  { label: 'الضريبة', value: formatMoney(form.tax || 0) },
  { label: 'الخصم', value: formatMoney(form.discount || 0) },
  {
    label: 'النهائي',
    value: formatMoney(form.final_amount || 0),
    total: true,
  },
])

const breadcrumbs = computed(() => [
  { label: 'الفواتير', to: { name: 'InvoicesList' } },
  { label: isEdit ? 'تعديل فاتورة' : 'فاتورة جديدة' },
])

function patientLabel(option) {
  return [option.first_name, option.surname].filter(Boolean).join(' ')
}

function visitLabel(option) {
  return `${option.visit_date} – ${option.main_complaints || ''}`
}

onMounted(async () => {
  if (!isEdit) return

  try {
    const result = await invoiceService.getById(route.params.id)
    const invoice = unwrapResponse(result)

    Object.assign(form, invoice)

    form.version = invoice.version || 1
    form.patient_id = invoice.patient || ''
    form.visit_id = invoice.visit || ''

    if (form.issued_date) {
      const parsed = new Date(form.issued_date)
      if (!Number.isNaN(parsed.getTime())) {
        form.issued_date = formatDate(parsed)
      }
    }

    if (form.due_date) {
      const parsed = new Date(form.due_date)
      if (!Number.isNaN(parsed.getTime())) {
        form.due_date = formatDate(parsed)
      }
    }

    markClean()
  } catch {
    // Keep empty form if loading fails.
  }
})

async function handleSubmit() {
  const success = await submit()
  if (success) {
    markClean()
  }
}
</script>
