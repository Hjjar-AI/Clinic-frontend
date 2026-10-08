<!-- frontend/src/components/patient/BulkActionsBar.vue -->
<template>
  <div
    v-if="count > 0"
    class="bulk-actions-bar card p-3 mb-3 flex flex--justify-between flex--center"
  >
    <span><strong>{{ count }}</strong> مريض محدد</span>
    <div class="flex gap-2">
      <button
        class="btn btn--pdf btn--sm"
        @click="$emit('export-pdf')"
      >
        <Icon icon="file-pdf" /> تصدير PDF
      </button>
      <button
        class="btn btn--danger btn--sm"
        @click="$emit('delete')"
      >
        <Icon icon="trash" /> حذف
      </button>
      <button
        class="btn btn--secondary btn--sm"
        @click="$emit('clear')"
      >
        إلغاء التحديد
      </button>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
defineProps({
  count: { type: Number, default: 0 }
})
defineEmits(['export-pdf', 'delete', 'clear'])
</script>