<!-- frontend/src/features/appointments/views/AppointmentForm.vue -->
<template>
  <FormWrapper
    :header-title="isEdit ? 'تعديل الموعد' : 'حجز موعد جديد'"
    header-icon="calendar-plus"
    :back-label="'العودة للتقويم'"
    :submitting="saving"
    submit-text="حفظ الموعد"
    :cancel-to="{ name: 'AppointmentsCalendar' }"
    :validation-errors="errors"
    :submit-error="submitError"
    @submit="handleSubmit"
  >
    <template #headerTitle>
      <Breadcrumb />
    </template>

    <FormField
      label="المريض"
      required
      :error="errors.patient_id"
    >
      <SearchInput
        v-model="selectedPatient"
        :search-fn="searchPatients"
        :option-label="patientLabel"
        :option-key="(p) => p.id"
        placeholder="ابحث باسم المريض أو الرقم الوطني..."
        :min-length="2"
        variant="inline"
        @select="onPatientSelected"
      />
    </FormField>

    <ApiSelect
      v-model="form.doctor_id"
      url="/auth/users/doctors/"
      value-key="id"
      label-key="full_name"
      label="الطبيب"
      required
      placeholder="اختر الطبيب"
      :error="errors.doctor_id"
    />

    <FormDate
      v-model="form.appointment_date"
      label="تاريخ الحجز"
      required
      :error="errors.appointment_date"
    />

    <FormField
      label="الوقت"
      required
    >
      <TimeSlotPicker
        v-model="form.appointment_time"
        :doctor-id="form.doctor_id"
        :date="form.appointment_date"
        :duration="form.duration_minutes"
        :current-value="currentAllowedTime"
        :error="errors.appointment_time"
        label="الوقت"
      />
    </FormField>

    <FormField label="المدة (دقائق)">
      <div class="flex flex--align-center gap-2">
        <input
          id="appointment-duration"
          v-model.number="form.duration_minutes"
          type="range"
          min="15"
          max="120"
          step="5"
          class="w-100"
          aria-label="مدة الموعد بالدقائق"
        >
        <output
          class="font-semibold text-sm"
          for="appointment-duration"
          aria-label="مدة الموعد المحددة"
        >{{ form.duration_minutes }} دقيقة</output>
      </div>
    </FormField>

    <FormSelect
      v-if="isEdit"
      v-model="form.status"
      label="الحالة"
      :options="statusOptions"
    />

    <FormTextarea
      v-if="['cancelled', 'no-show'].includes(form.status)"
      v-model="form.status_reason"
      label="سبب الإلغاء أو عدم الحضور"
      required
      :error="errors.status_reason"
      rows="2"
    />

    <FormTextarea
      v-model="form.notes"
      label="ملاحظات"
      rows="2"
    />
  </FormWrapper>
</template>

<script setup>
import { computed,nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import SearchInput from '@/components/common/SearchInput.vue'
import ApiSelect from '@/components/ui/ApiSelect.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormDate from '@/components/ui/FormDate.vue'
import FormField from '@/components/ui/FormField.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import FormTextarea from '@/components/ui/FormTextarea.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import { useApi } from '@/composables/useApi'
import { useDate } from '@/composables/useDate'
import { useFormDirty } from '@/composables/useFormDirty'
import { useFormDraft } from '@/composables/useFormDraft'
import { useFormSubmission } from '@/composables/useFormSubmission'
import { useNotify } from '@/composables/useNotify'
import { APPOINTMENT_STATUS_LABELS, STATUS_TRANSITIONS } from '@/constants/statusConstants'
import TimeSlotPicker from '@/features/appointments/components/TimeSlotPicker.vue'
import { useAppointmentStore } from '@/features/appointments/stores/appointments'
import patientService from '@/features/patients/services/patientService'
import { unwrapResponse } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()
const appointmentStore = useAppointmentStore()

const { formatDate, normalizeFormDates } = useDate()
const { notify } = useNotify()

const {
  draft,
  restoreDraftToForm,
  pauseDraft,
  resumeDraft,
  clearDraft,
} = useFormDraft()

const isEdit = !!route.params.id

const selectedPatient = ref(null)
const originalTime = ref('')
const originalDate = ref('')
const originalDoctorId = ref('')
const originalDuration = ref(30)
const isDirty = ref(false)
const trackingDirty = ref(false)
const errors = reactive({})

const currentAllowedTime = computed(() => {
  if (!isEdit) return ''
  const unchangedContext =
    form.value.appointment_date === originalDate.value &&
    String(form.value.doctor_id) === String(originalDoctorId.value) &&
    form.value.duration_minutes === originalDuration.value
  return unchangedContext ? originalTime.value : ''
})

// `useFormDirty` consumes an external dirty ref instead of creating its
// own (that was the third source of truth alongside useForm.isDirty and
// useFormSubmission.isDirty).
useFormDirty(isDirty)

const originalStatus = ref('scheduled')
const statusOptions = computed(() => {
  const statuses = [originalStatus.value, ...(STATUS_TRANSITIONS.appointment[originalStatus.value] || [])]
  return statuses.map(value => ({ value, label: APPOINTMENT_STATUS_LABELS[value] || value }))
})

// Field renamed `duration` -> `duration_minutes` to match the backend
// serializer's declared field name.
const form = ref({
  patient_id: '',
  doctor_id: '',
  appointment_date: formatDate(new Date()),
  appointment_time: '',
  duration_minutes: 30,
  status: 'scheduled',
  status_reason: '',
  notes: '',
  version: 1,
})

function patientLabel(patient) {
  if (!patient) return ''
  return (
    patient.full_name ||
    [patient.first_name, patient.surname].filter(Boolean).join(' ')
  )
}

const searchPatients = async (query) => {
  const result = await patientService.search({
    search: query,
    limit: 5,
  })
  const payload = unwrapResponse(result)
  return payload?.patients || []
}

const { execute: execSubmit } = useApi(
  async () => {
    const payload = normalizeFormDates(form.value, ['appointment_date'])

    if (isEdit) {
      await appointmentStore.updateAppointment(route.params.id, payload)
    } else {
      await appointmentStore.createAppointment(payload)
    }

    router.push('/appointments')
  },
  { silent: true }
)

const {
  submit,
  submitError,
  isSubmitting: saving,
} = useFormSubmission(validateForm, execSubmit)

function validateForm() {
  Object.keys(errors).forEach(key => delete errors[key])
  let valid = true
  if (!form.value.patient_id) {
    errors.patient_id = 'المريض مطلوب'
    valid = false
  }
  if (!form.value.doctor_id) {
    errors.doctor_id = 'الطبيب مطلوب'
    valid = false
  }
  if (!form.value.appointment_date) {
    errors.appointment_date = 'تاريخ الحجز مطلوب'
    valid = false
  }
  if (!form.value.appointment_time) {
    errors.appointment_time = 'اختر وقتاً متاحاً'
    valid = false
  }
  if (['cancelled', 'no-show'].includes(form.value.status) && !form.value.status_reason?.trim()) {
    errors.status_reason = 'السبب مطلوب'
    valid = false
  }
  return valid
}

function markDirty() {
  isDirty.value = true
}

let stopDraftWatcher = null

onMounted(async () => {
  if (route.query.date) {
    form.value.appointment_date = route.query.date
  }
  if (route.query.time) {
    form.value.appointment_time = route.query.time
  }

  if (!isEdit && route.query.patientId) {
    try {
      const patient = unwrapResponse(await patientService.getById(route.query.patientId))
      onPatientSelected(patient)
    } catch {
      notify('تعذر تحميل المريض المحدد.', 'warning')
    }
  }

  if (isEdit) {
    try {
      const data = await appointmentStore.fetchAppointment(route.params.id)
      Object.assign(form.value, data)
      originalStatus.value = data.status || 'scheduled'
      form.value.version = data.version || 1
      form.value.patient_id = data.patient || ''
      form.value.doctor_id = data.doctor || ''
      form.value.appointment_time = (data.appointment_time || '').slice(0, 5)
      originalTime.value = form.value.appointment_time

      if (form.value.appointment_date) {
        const parsed = new Date(form.value.appointment_date)
        if (!Number.isNaN(parsed.getTime())) {
          form.value.appointment_date = formatDate(parsed)
        }
      }

      originalDate.value = form.value.appointment_date
      originalDoctorId.value = form.value.doctor_id
      originalDuration.value = form.value.duration_minutes

      if (data.patient_name && data.patient) {
        selectedPatient.value = {
          id: data.patient,
          full_name: data.patient_name,
        }
      }
    } catch {
      notify('فشل تحميل الموعد.', 'danger')
    }
  }

  const restored = restoreDraftToForm()
  if (restored) {
    Object.assign(form.value, restored)
    notify('تم استعادة المسودة', 'info', { duration: 3000 })
  }

  resumeDraft()

  // Single draft watcher. Previously this file registered the same watcher
  // twice — once inside this onMounted and once in a separate onMounted —
  // and only the second one was torn down. The first leaked across route
  // navigations.
  stopDraftWatcher = watch(
    () => form.value,
    (value) => {
      draft.value = value
    },
    { deep: true, immediate: true }
  )

  await nextTick()
  isDirty.value = false
  trackingDirty.value = true
})

watch(form, () => {
  if (trackingDirty.value) isDirty.value = true
}, { deep: true })

onBeforeUnmount(() => {
  if (stopDraftWatcher) stopDraftWatcher()
})

function onPatientSelected(patient) {
  form.value.patient_id = patient ? patient.id : ''
  selectedPatient.value = patient
  markDirty()
}

async function handleSubmit() {
  pauseDraft()
  const success = await submit()
  if (success) {
    clearDraft()
    isDirty.value = false
  }
  resumeDraft()
}
</script>
