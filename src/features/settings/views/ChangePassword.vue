<template>
  <FormWrapper
    header-title="تغيير كلمة المرور"
    header-icon="key"
    :submitting="isSubmitting"
    submit-text="تحديث كلمة المرور"
    :cancel-fn="handleLogout"
    cancel-text="تسجيل الخروج"
    :validation-errors="errors"
    :submit-error="submitError"
    @submit="handleChangePassword"
  >
    <FormInput
      v-model="form.currentPassword"
      label="كلمة المرور الحالية"
      type="password"
      required
      :error="errors.currentPassword"
      autocomplete="current-password"
    />
    <FormInput
      v-model="form.newPassword"
      label="كلمة المرور الجديدة"
      type="password"
      required
      :error="errors.newPassword"
      help="8 خانات كحد أدنى"
      autocomplete="new-password"
    />
    <PasswordStrengthMeter
      :password="form.newPassword"
      :username="authStore.user?.username"
    />
    <FormInput
      v-model="form.confirmPassword"
      label="تأكيد كلمة المرور"
      type="password"
      required
      :error="errors.confirmPassword"
      autocomplete="new-password"
    />
  </FormWrapper>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import FormInput from '@/components/ui/FormInput.vue'
import FormWrapper from '@/components/ui/FormWrapper.vue'
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter.vue'
import { useApi } from '@/composables/useApi'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/features/auth/stores/auth'
import { isPasswordStrong } from '@/utils/validators'

const authStore = useAuthStore()
const router = useRouter()
const submitError = ref('')

// Note: `form` is a reactive object returned by useForm, NOT a ref.
// Previous version wrote `form.value.newPassword` inside the `custom`
// closure and `form.value.currentPassword` in the executor — both threw
// `Cannot read properties of undefined`. Fixed here.
const schema = [
  { field: 'currentPassword', label: 'كلمة المرور الحالية', required: true },
  {
    field: 'newPassword',
    label: 'كلمة المرور الجديدة',
    required: true,
    custom: (v) =>
      v && !isPasswordStrong(v, authStore.user?.username)
        ? 'كلمة المرور ضعيفة. يجب أن تكون 8 أحرف على الأقل، وليست رقمية فقط، وليست شائعة أو مشابهة لاسم المستخدم.'
        : '',
  },
  {
    field: 'confirmPassword',
    label: 'تأكيد كلمة المرور',
    required: true,
    // Closes over `form` lazily; `form` is defined by the time this runs.
    custom: (v) => (v !== form.confirmPassword ? 'غير متطابقة' : ''),
  },
]

const { form, errors, validate, setFieldError } = useForm(
  {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
  { schema }
)

const { loading: isSubmitting, execute: execSubmit } = useApi(
  async () => {
    await authStore.changePassword(form.currentPassword, form.newPassword)

    // The backend flushes the session on password change
    // (AuthService.change_password sets session_revoked_at and calls
    // request.session.flush()). Navigating to Dashboard after that leaves
    // the user on a dead session whose first API call returns 401. Clear
    // local auth state and send them to the login screen with an expired
    // marker so Login.vue can surface the right message.
    authStore.reset()
    router.push({ name: 'Login', query: { session: 'expired' } })
  },
  // `silent: true` because we surface the 400 (wrong current password)
  // via `setFieldError` below. Without this, both the global toast and
  // the field error would fire for the same rejection.
  { silent: true }
)

async function handleChangePassword() {
  submitError.value = ''
  const valid = await validate()
  if (!valid) return

  try {
    await execSubmit()
  } catch (e) {
    if (e.response?.status === 400) {
      setFieldError(
        'currentPassword',
        e.response?.data?.error || 'كلمة المرور الحالية غير صحيحة'
      )
    } else {
      submitError.value = 'فشل تغيير كلمة المرور.'
    }
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>