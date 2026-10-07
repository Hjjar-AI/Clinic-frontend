<!-- frontend/src/features/patients/views/PatientForm.vue -->
<template>
  <FormWrapper
    :header-title="isEdit ? 'تعديل بيانات المريض' : 'فتح ملف طبي جديد'"
    header-icon="user-plus"
    :back-label="isEdit ? 'العودة للملف' : 'العودة للقائمة'"
    :submitting="isSubmitting"
    :submit-text="isEdit ? 'تحديث السجل الطبي' : 'حفظ وإنشاء الملف'"
    :cancel-fn="cancel"
    :validation-errors="errors"
    :submit-error="submitError"
    @submit="handleSubmit"
    @cancel="cancel"
  >
    <template #headerTitle>
      <Breadcrumb />
    </template>

    <PatientFormDemographics
      :form="form"
      :errors="errors"
      :field-states="fieldStates"
      :gender-options="genderOptions"
      :year-options="yearOptions"
      :marital-status-options="maritalStatusOptions"
    />
    <PatientFormSocial
      :form="form"
      :errors="errors"
      :field-states="fieldStates"
    />
    <PatientFormMedical :form="form" />

    <AlertBar
      v-if="potentialDuplicates.length"
      severity="warning"
      title="وجدنا ملفات قد تخص المريض نفسه"
      class="mt-3"
    >
      <ul>
        <li
          v-for="match in potentialDuplicates"
          :key="match.id"
        >
          {{ match.full_name }} — {{ match.national_id || match.phone || `ملف #${match.id}` }}
        </li>
      </ul>
      <ConfirmCheckbox
        v-model="duplicateOverride"
        label="راجعت النتائج وأريد إنشاء ملف مستقل"
        variant="warning"
      />
    </AlertBar>

    <!-- Doctor selection for receptionist -->
    <div
      v-if="authStore.user?.role === 'receptionist'"
      class="mt-4"
    >
      <ApiSelect
        v-model="form.doctor_id"
        url="/auth/users/doctors/"
        value-key="id"
        label-key="full_name"
        label="الطبيب المسؤول"
        required
        placeholder="اختر الطبيب"
        :error="errors.doctor_id"
      />
    </div>
  </FormWrapper>
</template>

<script setup>
import { computed, onBeforeUnmount,onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AlertBar from '@/components/ui/AlertBar.vue'
import ApiSelect from '@/components/ui/ApiSelect.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import ConfirmCheckbox from '@/components/ui/ConfirmCheckbox.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import { useApi } from '@/composables/useApi'
import { useDate } from '@/composables/useDate'
import { useForm } from '@/composables/useForm'
import { useFormDirty } from '@/composables/useFormDirty'
import { useFormDraft } from '@/composables/useFormDraft'
import { useFormSubmission } from '@/composables/useFormSubmission'
import { useNotify } from '@/composables/useNotify'
import { useValidator } from '@/composables/useValidator'
import { useAuthStore } from '@/features/auth/stores/auth'
import PatientFormDemographics from '@/features/patients/components/PatientFormDemographics.vue'
import PatientFormMedical from '@/features/patients/components/PatientFormMedical.vue'
import PatientFormSocial from '@/features/patients/components/PatientFormSocial.vue'
import patientService from '@/features/patients/services/patientService'
import { usePatientStore } from '@/features/patients/stores/patients'
import { useConstantsStore } from '@/stores/constants'
import {
dobYearRule,   firstNameRule, genderRule, nationalIdRule,
phoneRule, surnameRule} from '@/utils/validationRules'
import { normalizePhone } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const authStore = useAuthStore()
const constantsStore = useConstantsStore()
const { notify } = useNotify()
const isEdit = !!route.params.id
const { normalizeFormDates } = useDate()
const {
  validatePhone: validateConfiguredPhone,
  validateNationalId: validateConfiguredNationalId,
} = useValidator()
const { draft, restoreDraftToForm, pauseDraft, resumeDraft, clearDraft } = useFormDraft()
const potentialDuplicates = ref([])
const duplicateOverride = ref(false)

const genderOptions = [{ value: 'ذكر', label: 'ذكر' }, { value: 'أنثى', label: 'أنثى' }]
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
  const year = currentYear - i
  return { value: year.toString(), label: year.toString() }
})

const maritalStatusOptions = computed(() => {
  const gender = form.gender
  if (!gender) return []
  const list = gender === 'ذكر'
    ? constantsStore.data.marital_status_male
    : constantsStore.data.marital_status_female
  return list.map(status => ({ value: status, label: status }))
})

const initialFormData = {
  first_name: '', surname: '', father_name: '', mother_name: '',
  gender: '', dob_year: '', phone: '', marital_status: '',
  occupation: '', address: '', national_id: '', admission_date: '',
  family_history: '', important_notes: '', doctor_id: null, version: 1,
}

const schema = [
  firstNameRule(),
  surnameRule(),
  genderRule(),
  dobYearRule(),
  phoneRule('phone', validateConfiguredPhone),
  nationalIdRule('national_id', validateConfiguredNationalId)
]

const { form, errors, fieldStates, isDirty, validate, markClean } = useForm(
  { ...initialFormData },
  { formId: 'patientForm', schema }
)

// Single source of truth for dirty state: the ref returned by useForm.
useFormDirty(isDirty)

const { execute } = useApi(async () => {
  const phone = normalizePhone(form.phone)

  const payload = normalizeFormDates({
    first_name: form.first_name,
    father_name: form.father_name || '',
    surname: form.surname,
    mother_name: form.mother_name || '',
    gender: form.gender,
    dob_year: parseInt(form.dob_year) || null,
    marital_status: form.marital_status || '',
    national_id: form.national_id || '',
    phone: phone || '',
    occupation: form.occupation || '',
    permanent_address: form.address || '',
    admission_date: form.admission_date || '',
    family_history: form.family_history || '',
    important_notes: form.important_notes || '',
    doctor_id: form.doctor_id || undefined,
  }, ['admission_date'])

  if (isEdit) {
    payload.version = form.version
    await patientStore.updatePatient(route.params.id, payload)
    router.push({ name: 'PatientDetail', params: { id: route.params.id } })
  } else {
    if (!duplicateOverride.value) {
      const duplicateResult = await patientService.findDuplicates(payload)
      potentialDuplicates.value = duplicateResult?.matches || []
      if (potentialDuplicates.value.length) {
        throw new Error('راجع الملفات المتشابهة قبل إنشاء ملف جديد.')
      }
    }
    const newPatient = await patientStore.createPatient(payload)
    router.push({ name: 'PatientDetail', params: { id: newPatient.id } })
  }
}, { silent: true })

const { submit, submitError, isSubmitting } = useFormSubmission(validate, execute)

let stopDraftWatcher = null

onMounted(async () => {
  await constantsStore.fetch()
  if (isEdit) {
    try {
      const data = await patientStore.fetchPatient(route.params.id)
      Object.assign(form, {
        first_name: data.first_name || '',
        father_name: data.father_name || '',
        surname: data.surname || '',
        mother_name: data.mother_name || '',
        gender: data.gender || '',
        dob_year: data.dob_year ? String(data.dob_year) : '',
        phone: data.phone || '',
        marital_status: data.marital_status || '',
        occupation: data.occupation || '',
        address: data.permanent_address || '',
        national_id: data.national_id || '',
        admission_date: data.admission_date || '',
        family_history: data.family_history || '',
        important_notes: data.important_notes || '',
        doctor_id: data.doctor_id_output || data.doctor || null,
        version: data.version || 1,
      })
      // Clear dirty after hydration: the loaded values are the new baseline.
      markClean()
    } catch {
      notify('خطأ في تحميل بيانات المريض.', 'danger')
    }
  }

  const restored = restoreDraftToForm()
  if (restored) {
    Object.assign(form, restored)
    notify('تم استعادة المسودة', 'info', { duration: 3000 })
  }

  resumeDraft()

  stopDraftWatcher = watch(form, (val) => { draft.value = val }, { deep: true, immediate: true })
})

onBeforeUnmount(() => {
  if (stopDraftWatcher) stopDraftWatcher()
})

async function handleSubmit() {
  pauseDraft()
  const success = await submit()
  if (success) {
    clearDraft()
    markClean()
  }
  resumeDraft()
}

function cancel() {
  if (isEdit) router.push({ name: 'PatientDetail', params: { id: route.params.id } })
  else router.push({ name: 'PatientsList' })
}
</script>
