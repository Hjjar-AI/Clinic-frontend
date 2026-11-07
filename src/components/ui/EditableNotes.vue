<template>
  <BaseCard class="mt-4">
    <CardHeader
      variant="neutral"
      icon="sticky-note"
      title="مسودة مؤقتة"
    />
    <div class="card__body">
      <textarea
        v-model="notes"
        placeholder="مسودة لهذه الجلسة فقط؛ سجّل المعلومات الطبية في ملف المريض."
        class="form-control form-control--textarea editable-notes"
        rows="2"
        aria-label="ملاحظات سريعة"
      />
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { onSessionChange } from '@/services/sessionState'
import { onBeforeUnmount } from 'vue'
const props = defineProps({ userId: { type: [Number, String], default: null } })
const notes = ref('')
try {
  for (const key of Object.keys(localStorage)) if (key.startsWith('dashboard_notes_')) localStorage.removeItem(key)
  localStorage.removeItem(STORAGE_KEYS.DASHBOARD_NOTES(props.userId))
} catch { /* Browser storage may be disabled. */ }
watch(() => props.userId, () => { notes.value = '' })
const dispose = onSessionChange(() => { notes.value = '' })
onBeforeUnmount(dispose)

</script>
