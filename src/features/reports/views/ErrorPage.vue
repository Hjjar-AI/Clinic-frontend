<template>
  <div class="error-page">
    <PageHeader :title="displayTitle" />
    <EmptyState
      :type="emptyType"
      :title="displayTitle"
      :description="description"
      :action-text="''"
      :action-url="''"
    >
      <template #actions>
        <div class="flex flex--gap-2 flex--justify-center">
          <BaseButton
            variant="primary"
            to="/dashboard"
          >
            العودة للرئيسية
          </BaseButton>
          <BaseButton
            variant="secondary"
            @click="router.back()"
          >
            إعادة المحاولة
          </BaseButton>
        </div>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const props = defineProps({
  code: { type: [Number, String], default: 500 },
  reason: { type: String, default: '' }
})

const route = useRoute()
const router = useRouter()

// Parenthesize the ternary. The old expression was
//   `props.code || route.query.reason ? 403 : 500`
// which `||` binds tighter than `?:`, so any truthy `props.code`
// (including 404 from the catch-all route) selected 403. The subsequent
// `if (code === 404)` branch was therefore dead code.
const effectiveCode = computed(() => props.code || (route.query.reason ? 403 : 500))
const effectiveReason = computed(() => props.reason || route.query.reason)

const errorConfig = computed(() => {
  const code = Number(effectiveCode.value) || 500
  if (code === 404) {
    return { title: 'غير موجود', description: 'قد يكون العنوان الذي أدخلته غير صحيح أو تم نقل الصفحة.', emptyType: 'search' }
  }
  if (code === 403 || effectiveReason.value === 'permission') {
    return { title: 'غير مصرح', description: 'ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى الاتصال بالمدير.', emptyType: 'default' }
  }
  return { title: 'حدث خطأ غير متوقع', description: 'يرجى العودة إلى الصفحة السابقة أو الاتصال بالدعم إذا استمرت المشكلة.', emptyType: 'default' }
})

const displayTitle = computed(() => errorConfig.value.title)
const description = computed(() => errorConfig.value.description)
const emptyType = computed(() => errorConfig.value.emptyType)
</script>