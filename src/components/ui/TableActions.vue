<template>
  <div class="flex gap-1">
    <BaseButton
      v-if="showView && safeViewTo"
      variant="ghost"
      size="xs"
      icon="eye"
      :title="viewTitle"
      :to="safeViewTo"
      @click="!safeViewTo && $emit('view')"
    />
    <BaseButton
      v-if="showEdit && safeEditTo"
      variant="ghost"
      size="xs"
      icon="edit"
      :title="editTitle"
      :to="safeEditTo"
      @click="!safeEditTo && $emit('edit')"
    />
    <BaseButton
      v-if="showDelete"
      variant="ghost"
      size="xs"
      icon="trash"
      :title="deleteTitle"
      :confirm-message="confirmMessage"
      :confirm-checkbox="true"
      @confirmed="$emit('delete')"
    />
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  showView: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  viewTitle: { type: String, default: 'عرض' },
  editTitle: { type: String, default: 'تعديل' },
  deleteTitle: { type: String, default: 'حذف' },
  viewTo: { type: [String, Object], default: null },
  editTo: { type: [String, Object], default: null },
  confirmMessage: { type: String, default: 'هل أنت متأكد من الحذف؟' },
})

defineEmits(['view', 'edit', 'delete'])

function isValidTo(to) {
  if (!to) return false
  if (typeof to === 'string') return true
  // Check if the route has all required params
  if (to.params) {
    // If there's an 'id' param, it must have a value
    if ('id' in to.params && (to.params.id === undefined || to.params.id === null || to.params.id === '')) {
      return false
    }
  }
  return true
}

const safeViewTo = computed(() => isValidTo(props.viewTo) ? props.viewTo : null)
const safeEditTo = computed(() => isValidTo(props.editTo) ? props.editTo : null)
</script>