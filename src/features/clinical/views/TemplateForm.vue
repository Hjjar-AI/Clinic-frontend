<!-- frontend/src/features/clinical/views/TemplateForm.vue -->
<template>
  <FormWrapper
    :header-title="isEdit ? 'تعديل قالب' : 'قالب جديد'"
    header-icon="file-alt"
    back-label="العودة للقوالب"
    :submitting="saving"
    submit-text="حفظ القالب"
    :cancel-to="{ name: 'Templates' }"
    :validation-errors="errors"
    :submit-error="submitError"
    @submit="handleSubmit"
  >
    <template #headerTitle>
      <Breadcrumb :items="breadcrumbs" />
    </template>

    <div class="grid-2 gap-3">
      <FormInput
        v-model="form.name"
        label="اسم القالب"
        required
        :error="errors.name"
      />
      <FormSelect
        v-model="form.category"
        label="التصنيف"
        required
        :error="errors.category"
        :options="categoryOptions"
      />
    </div>
    <FormTextarea
      v-model="form.description"
      label="الوصف"
      rows="2"
    />

    <h4 class="heading-5 border-bottom pb-2 mb-3 mt-4 text-primary">
      <Icon icon="clipboard" /> محتوى القالب
    </h4>
    <FormTextarea
      v-model="form.mse"
      label="الفحص العقلي (MSE)"
      rows="4"
    />

    <div class="grid-2 gap-3">
      <FormInput
        v-model="form.formulation_predisposing"
        label="العوامل المهيئة"
      />
      <FormInput
        v-model="form.formulation_precipitating"
        label="العوامل المسببة"
      />
      <FormInput
        v-model="form.formulation_perpetuating"
        label="العوامل المستمرة"
      />
      <FormInput
        v-model="form.formulation_protective"
        label="العوامل الوقائية"
      />
    </div>

    <FormTextarea
      v-model="form.risk_notes"
      label="ملاحظات المخاطر"
      rows="3"
    />
    <FormTextarea
      v-model="form.treatment_text"
      label="توصيات علاجية"
      rows="3"
    />
    <FormTextarea
      v-model="form.doctor_notes"
      label="ملاحظات الطبيب"
      rows="3"
    />
  </FormWrapper>
</template>

<script setup>
import { computed,onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import FormTextarea from '@/components/ui/FormTextarea.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import Icon from '@/components/ui/Icon.vue'
import { useApi } from '@/composables/useApi'
import { useForm } from '@/composables/useForm'
import { useFormDirty } from '@/composables/useFormDirty'
import { useFormSubmission } from '@/composables/useFormSubmission'
import templateService from '@/features/clinical/services/templateService'
import { unwrapResponse } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()

const isEdit = !!route.params.id
const submitError = ref('')

const categoryOptions = [
  { value: 'depression', label: 'اكتئاب' },
  { value: 'anxiety', label: 'قلق' },
  { value: 'psychosis', label: 'ذهان' },
  { value: 'bipolar', label: 'ثنائي القطب' },
  { value: 'ptsd', label: 'ما بعد الصدمة' },
  { value: 'other', label: 'أخرى' },
]

const initialData = {
  name: '',
  category: 'depression',
  description: '',
  mse: '',
  formulation_predisposing: '',
  formulation_precipitating: '',
  formulation_perpetuating: '',
  formulation_protective: '',
  risk_notes: '',
  treatment_text: '',
  doctor_notes: '',
}

const schema = [
  { field: 'name', label: 'اسم القالب', required: true },
  { field: 'category', label: 'التصنيف', required: true },
]

const { form, errors, isDirty, validate, markClean } = useForm(initialData, { schema })

// Single source of truth: the ref returned by useForm.
useFormDirty(isDirty)

const { execute: execSubmit } = useApi(
  async () => {
    const content = {
      mse: form.mse || '',
      formulation: {
        predisposing: form.formulation_predisposing || '',
        precipitating: form.formulation_precipitating || '',
        perpetuating: form.formulation_perpetuating || '',
        protective: form.formulation_protective || '',
      },
      risk_notes: form.risk_notes || '',
      treatment_text: form.treatment_text || '',
      doctor_notes: form.doctor_notes || '',
    }

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      content,
    }

    if (isEdit) {
      await templateService.update(route.params.id, payload)
    } else {
      await templateService.create(payload)
    }

    router.push({ name: 'Templates' })
  },
  { silent: true }
)

const { submit, submitError: submissionError, isSubmitting: saving } = useFormSubmission(validate, execSubmit)

const breadcrumbs = computed(() => [
  { label: 'القوالب', to: { name: 'Templates' } },
  { label: isEdit ? 'تعديل قالب' : 'قالب جديد' },
])

onMounted(async () => {
  if (!isEdit) return

  try {
    const result = await templateService.getById(route.params.id)
    const template = unwrapResponse(result)

    const content = template.content || {}

    Object.assign(form, {
      name: template.name || '',
      description: template.description || '',
      category: template.category || 'depression',
      mse: content.mse || '',
      formulation_predisposing: content.formulation?.predisposing || '',
      formulation_precipitating: content.formulation?.precipitating || '',
      formulation_perpetuating: content.formulation?.perpetuating || '',
      formulation_protective: content.formulation?.protective || '',
      risk_notes: content.risk_notes || '',
      treatment_text: content.treatment_text || '',
      doctor_notes: content.doctor_notes || '',
    })

    markClean()
  } catch {
    // Keep empty form if loading fails.
  }
})

async function handleSubmit() {
  submitError.value = ''
  const success = await submit()
  if (success) {
    markClean()
  } else {
    submitError.value = submissionError.value || 'فشل الحفظ. حاول مرة أخرى؟'
  }
}
</script>