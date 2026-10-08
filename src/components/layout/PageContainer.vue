<template>
  <div class="page-wrapper" :class="`page-wrapper--${width}`">
    <div
      v-if="status === 'loading'"
      class="page-wrapper__skeleton"
    >
      <SkeletonLoader
        type="page"
        :count="1"
      />
    </div>

    <div
      v-else-if="status === 'empty'"
      class="card"
    >
      <div class="card__body">
        <EmptyState
          :title="emptyTitle || 'لا توجد بيانات حالياً'"
          :description="emptyDescription || 'قم بإضافة سجلات جديدة لتظهر في هذه الشاشة.'"
          :action-text="emptyActionText || ''"
          :action-url="emptyActionUrl || ''"
          :type="emptyType || 'default'"
        >
          <template
            v-if="$slots['empty-actions']"
            #actions
          >
            <slot name="empty-actions" />
          </template>
        </EmptyState>
      </div>
    </div>

    <div
      v-else-if="status === 'error'"
      class="error-state-card card"
    >
      <div class="card__body text-center">
        <Icon
          icon="exclamation-triangle"
          class="text-danger text-2xl mb-2"
        />
        <h3 class="text-danger">
          حدث خطأ أثناء تحميل البيانات
        </h3>
        <p class="text-muted text-sm">
          {{ errorMessage || 'يرجى المحاولة مرة أخرى.' }}
        </p>
        <button
          class="btn btn--secondary mt-2"
          @click="$emit('retry')"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>

    <div
      v-else
      class="page-content"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

defineProps({
  width: { type: String, default: 'standard', validator: value => ['standard', 'wide', 'form'].includes(value) },
  status: { type: String, default: 'loading', validator: (v) => ['loading', 'empty', 'error', 'content'].includes(v) },
  emptyTitle: { type: String, default: '' },
  emptyDescription: { type: String, default: '' },
  emptyActionText: { type: String, default: '' },
  emptyActionUrl: { type: [String, Object], default: null },
  emptyType: { type: String, default: 'default' },
  errorMessage: { type: String, default: '' }
})

defineEmits(['retry'])
</script>