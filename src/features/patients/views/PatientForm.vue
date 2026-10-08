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
    <PatientProfileFields :form="form" :is-edit="isEdit" />

    <AlertBar
      v-if="potentialDuplicates.length && !duplicatesDismissed"
      severity="warning"
      title="وجدنا ملفات قد تخص المريض نفسه"
      class="mt-3"
    >
      <ul>
        <li
          v-for="match in potentialDuplicates"
          :key="match.id"
        >
          {{ match.full_name }} — {{ match.patient_number }} · {{ match.is_active ? 'نشط' : 'مؤرشف' }}
        </li>
      </ul>
      <p>يمكنك حفظ ملف مستقل دون تغيير رقم الهوية أو دمج أي ملف.</p>
      <BaseButton variant="secondary" size="sm" @click="duplicatesDismissed=true">تجاهل التنبيه</BaseButton>
    </AlertBar>

    <MultiSelect v-if="!isEdit" v-model="form.care_team_ids" :options="teamCandidates" :option-key="user => user.id" :option-label="user => user.full_name" label="فريق الرعاية الأولي (اختياري)" />
  </FormWrapper>
</template>

<script setup>
import { computed, onBeforeUnmount,onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AlertBar from '@/components/ui/AlertBar.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import PatientProfileFields from '@/features/patients/components/PatientProfileFields.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
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
const duplicatesDismissed = ref(false)
const teamCandidates = ref([])
let duplicateTimer = null
let duplicateGeneration = 0

const genderOptions = [{ value: 'ذكر', label: 'ذكر' }, { value: 'أنثى', label: 'أنثى' }]
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
  const year = currentYear - i
  return { value: year.toString(), label: year.toString() }
})

const maritalStatusOptions = computed(() => {
  const gender = form.gender
  if (!gender) return [...new Set([...(constantsStore.data.marital_status_male || []), ...(constantsStore.data.marital_status_female || [])])].map(status => ({value:status,label:status}))
  const list = gender === 'ذكر'
    ? constantsStore.data.marital_status_male
    : constantsStore.data.marital_status_female
  return list.map(status => ({ value: status, label: status }))
})

const initialFormData = {
  first_name: '', surname: '', father_name: '', mother_name: '',
  gender: '', dob_year: '', phone: '', marital_status: '',
  occupation: '', address: '', national_id: '', registration_date: '',
  family_history: '', important_notes: '', care_team_ids: [], version: 1,
  identity_verification: 'reported', preferred_language: '', preferred_contact_channel: '', communication_restrictions: '',
  allergy_status: 'unknown', medication_status: 'unknown', correction_reason: '',
}

const schema = [
  firstNameRule(),
  surnameRule(),
  { ...genderRule(), required: false },
  { ...dobYearRule(), required: false },
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
    registration_date: form.registration_date || '',
    family_history: form.family_history || '',
    important_notes: form.important_notes || '',
    care_team_ids: !isEdit ? form.care_team_ids : undefined,
    correction_reason: form.correction_reason,
    identity_verification: form.identity_verification === 'verified' && !['doctor','admin'].includes(authStore.user?.role) ? undefined : form.identity_verification,
    preferred_language: form.preferred_language, preferred_contact_channel: form.preferred_contact_channel,
    communication_restrictions: form.communication_restrictions,
    ...(authStore.can('edit_visit') ? {allergy_status:form.allergy_status,medication_status:form.medication_status} : {}),
  }, ['registration_date'])

  if (isEdit) {
    payload.version = form.version
    await patientStore.updatePatient(route.params.id, payload)
    router.push({ name: 'PatientDetail', params: { id: route.params.id } })
  } else {
    const newPatient = await patientStore.createPatient(payload)
    router.push({ name: 'PatientDetail', params: { id: newPatient.id } })
  }
}, { silent: true })

const { submit, submitError, isSubmitting } = useFormSubmission(validate, execute)

let stopDraftWatcher = null

onMounted(async () => {
  await constantsStore.fetch()
  if (!isEdit) { try { teamCandidates.value = await patientService.getTeamCandidates() } catch { notify('تعذر تحميل أعضاء الفريق؛ يمكنك إضافتهم بعد حفظ الملف', 'warning') } }
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
        registration_date: data.registration_date || '',
        family_history: data.family_history || '',
        important_notes: data.important_notes || '',
        identity_verification: data.identity_verification || 'reported', preferred_language:data.preferred_language || '',
        preferred_contact_channel:data.preferred_contact_channel || '', communication_restrictions:data.communication_restrictions || '',
        allergy_status:data.allergy_status || 'unknown', medication_status:data.medication_status || 'unknown',
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
  clearTimeout(duplicateTimer)
  duplicateGeneration++
  if (stopDraftWatcher) stopDraftWatcher()
})

watch(() => [form.first_name, form.surname, form.national_id, form.phone, form.dob_year], () => {
  clearTimeout(duplicateTimer)
  const current = ++duplicateGeneration
  duplicateTimer = setTimeout(async () => {
    try {
      const result = await patientService.findDuplicates({...form, dob_year: parseInt(form.dob_year) || null, exclude_id: isEdit ? Number(route.params.id) : undefined})
      if (current !== duplicateGeneration) return
      potentialDuplicates.value = result.matches || []
      duplicatesDismissed.value = false
    } catch { /* Duplicate checks are optional and never prevent registration. */ }
  }, 500)
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
