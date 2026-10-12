<!-- frontend/src/features/settings/views/UserForm.vue -->
<template>
  <ResourceFeedback :error="stampError" />
  <FormWrapper :ready="resourceReady" :load-error="resourceError" @retry="resource.retry" width="sm"
    :header-title="isEdit ? 'تعديل مستخدم' : 'مستخدم جديد'"
    header-icon="user-plus"
    back-label="العودة للمستخدمين"
    :submitting="saving"
    submit-text="حفظ"
    :cancel-to="{ name: 'Users' }"
    :validation-errors="errors"
    :submit-error="submitError"
    @submit="handleSubmit"
  >
    <template #headerTitle>
      <Breadcrumb :items="breadcrumbs" />
    </template>

    <FormInput
      v-model="form.username"
      label="اسم المستخدم"
      required
      :error="errors.username"
    />
    <FormInput
      v-model="form.full_name"
      label="الاسم الكامل"
    />
    <FormSelect
      v-model="form.role"
      label="الدور"
      required
      :options="roleOptions"
    />
    <FormInput
      v-model="form.password"
      :label="isEdit ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'"
      type="password"
      :required="!isEdit"
      :error="errors.password"
      :help="isEdit ? 'اتركها فارغة للإبقاء على كلمة المرور الحالية (8 خانات كحد أدنى إن أدخلت قيمة)' : '8 خانات كحد أدنى'"
    />
    <FormInput
      v-if="!isEdit"
      v-model="form.confirm_password"
      label="تأكيد كلمة المرور"
      type="password"
      required
      :error="errors.confirm_password"
    />
    <FormField label="ختم الطبيب (اختياري)">
      <input
        type="file"
        accept=".png,.jpg,.jpeg"
        aria-label="ختم الطبيب"
        class="form-control"
        @change="handleStamp"
      >
      <small class="text-muted">PNG أو JPG، بحد أقصى 2 ميغابايت.</small>
    </FormField>
  </FormWrapper>
</template>

<script setup>
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useResourceLoad } from '@/composables/useResourceLoad'
import { computed,onBeforeUnmount,onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FormField from '@/components/ui/FormField.vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import { useApi } from '@/composables/useApi'
import { useForm } from '@/composables/useForm'
import { useFormDirty } from '@/composables/useFormDirty'
import { useFormSubmission } from '@/composables/useFormSubmission'
import userService from '@/features/settings/services/userService'
import { unwrapResponse } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()

const isEdit = !!route.params.id
const resource = useResourceLoad(!isEdit)
const { ready: resourceReady, error: resourceError } = resource
const stampError = ref('')
let stampGeneration = 0
onBeforeUnmount(() => { stampGeneration += 1 })
const stampData = ref('')

const roleOptions = [
  { value: 'admin', label: 'مدير' },
  { value: 'doctor', label: 'طبيب' },
  { value: 'receptionist', label: 'موظف استقبال' },
]

const initialData = {
  username: '',
  full_name: '',
  role: 'doctor',
  password: '',
  confirm_password: '',
  version: 1,
}

// `minLength` on the password rule is enforced only when the field is
// non-empty (useForm's buildYupSchema short-circuits on empty strings), so
// this is safe for edit mode where leaving the field blank means "keep the
// current password". Matches the backend MinimumLengthValidator (8).
const schema = [
  { field: 'username', label: 'اسم المستخدم', required: true },
  { field: 'role', label: 'الدور', required: true },
  {
    field: 'password',
    label: 'كلمة المرور',
    required: !isEdit,
    minLength: 8,
    message: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل',
  },
  {
    field: 'confirm_password',
    label: 'تأكيد كلمة المرور',
    required: !isEdit,
    custom: (v) => (!v || v === form.password ? '' : 'كلمتا المرور غير متطابقتين'),
  },
]

const { form, errors, isDirty, validate, markClean } = useForm(initialData, { schema })

// Single source of truth: the ref returned by useForm.
useFormDirty(isDirty)

const { execute: execSubmit } = useApi(
  async () => {
    const payload = {
      username: form.username,
      full_name: form.full_name,
      role: form.role,
      version: form.version,
    }

    if (form.password) {
      payload.password = form.password
    }

    if (stampData.value) payload.stamp_data = stampData.value

    if (isEdit) {
      await userService.update(route.params.id, payload)
    } else {
      await userService.create(payload)
    }

    markClean()
    router.push({ name: 'Users' })
  },
  { silent: true }
)

const { submit, submitError, isSubmitting: saving } = useFormSubmission(validate, execSubmit)

const breadcrumbs = computed(() => [
  { label: 'المستخدمين', to: { name: 'Users' } },
  { label: isEdit ? 'تعديل مستخدم' : 'مستخدم جديد' },
])

onMounted(() => resource.load(async (isCurrent) => {
  if (!isEdit) return

  try {
    const result = await userService.getById(route.params.id)
    const user = unwrapResponse(result)
    if (!user?.id || !Number.isInteger(user.version) || user.version < 1) throw new Error('تعذر تحميل إصدار السجل')
    if (!isCurrent()) return

    Object.assign(form, {
      username: user.username || '',
      full_name: user.full_name || '',
      role: user.role || 'doctor',
      password: '',
      confirm_password: '',
      version: user.version || 1,
    })
    // Loaded values become the new baseline.
    markClean()
  } catch {
    throw new Error('تعذر تحميل السجل')
  }
}))

function handleStamp(event) {
  const request = ++stampGeneration
  stampData.value = null
  stampError.value = ''
  const file = event.target.files?.[0]
  if (!file) return
  if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    event.target.value = ''
    stampError.value = 'يلزم PNG أو JPEG بحجم حتى 2 ميغابايت'
    return
  }
  const reader = new FileReader()
  reader.onload = () => { if (request === stampGeneration) stampData.value = String(reader.result || '') }
  reader.onerror = reader.onabort = () => { if (request === stampGeneration) stampError.value = 'تعذر قراءة الختم' }
  reader.readAsDataURL(file)
}

async function handleSubmit() {
  if (!resourceReady.value) return
  const success = await submit()
  if (success) {
    markClean()
  }
}
</script>
