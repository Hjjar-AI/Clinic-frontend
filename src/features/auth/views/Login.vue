<!-- frontend/src/features/auth/views/Login.vue -->
<template>
  <div class="login-wrapper">
    <BaseCard class="login-card">
      <div class="card__body">
        <div class="text-center mb-4">
          <Avatar
            size="xl"
            color="primary"
            icon="shield-alt"
          />
          <h2 class="heading-3 m-0 text-primary font-bold mt-3">
            بوابة تسجيل الدخول
          </h2>
          <p class="text-muted text-sm mt-2">
            نظام إدارة العيادة النفسية الرقمي
          </p>
        </div>

        <!-- Session expired message -->
        <div
          v-if="sessionExpired"
          class="alert alert--warning mb-3 text-sm text-center"
        >
          <Icon icon="exclamation-triangle" />
          انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.
        </div>

        <form @submit.prevent="handleLogin">
          <FormField
            label="اسم المستخدم"
            field-id="loginUsername"
            required
            :error="errors.username"
          >
            <input
              id="loginUsername"
              v-model="username"
              type="text"
              class="form-control"
              placeholder="Username..."
              required
              autocomplete="username"
            >
          </FormField>

          <FormField
            label="كلمة المرور"
            field-id="loginPassword"
            required
            :error="errors.password"
          >
            <div class="relative">
              <input
                id="loginPassword"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              >
              <BaseButton
                variant="ghost"
                size="xs"
                class="password-toggle"
                :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                :icon="showPassword ? 'eye-slash' : 'eye'"
                @click="showPassword = !showPassword"
              />
            </div>
          </FormField>

          <div class="mb-3">
            <label
              class="checkbox"
              for="remember-session"
            >
              <input
                id="remember-session"
                v-model="rememberMe"
                type="checkbox"
                class="checkbox__input"
              >
              <span>البقاء متصلاً</span>
            </label>
          </div>

          <div
            v-if="serverError"
            class="alert alert--danger mb-3 text-sm text-center"
          >
            {{ serverError }}
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="loading"
            block
          >
            <Icon icon="sign-in-alt" /> {{ loading ? 'جاري الدخول...' : 'تسجيل الدخول' }}
          </BaseButton>
        </form>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { onMounted,reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Avatar from '@/components/ui/Avatar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import FormField from '@/components/ui/FormField.vue'
import Icon from '@/components/ui/Icon.vue'
import { useAuthStore } from '@/features/auth/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const serverError = ref('')
const loading = ref(false)
const errors = reactive({ username: '', password: '' })

// Check for session expired query parameter
const sessionExpired = ref(false)
onMounted(() => {
  if (route.query.session === 'expired') {
    sessionExpired.value = true
  }
})

function validate() {
  errors.username = ''; errors.password = ''; let valid = true
  if (!username.value.trim()) { errors.username = 'مطلوب'; valid = false }
  if (!password.value) { errors.password = 'مطلوب'; valid = false }
  return valid
}

async function handleLogin() {
  serverError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    const success = await authStore.login(username.value, password.value, rememberMe.value)
    if (success) router.push(route.query.returnTo || { name: 'Dashboard' })
    else serverError.value = 'بيانات الاعتماد غير صحيحة.'
  } catch (error) {
    const backendMessage = error?.response?.data?.error?.message
    if (backendMessage) {
      serverError.value = backendMessage
    } else {
      serverError.value = 'فشل الاتصال بالخادم.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-4); background: var(--color-surface-soft); }
.login-card { max-width: var(--modal-width-sm); width: 100%; box-shadow: var(--shadow-elevation-4); }
.relative { position: relative; }
.password-toggle { position: absolute; inset-inline-end: var(--space-2); top: 50%; transform: translateY(-50%); }
</style>
