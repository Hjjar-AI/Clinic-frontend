<template>
  <BaseCard class="mt-4">
    <CardHeader
      variant="neutral"
      icon="sticky-note"
      title="ملاحظات سريعة"
    >
      <transition name="fade">
        <span
          v-if="saved"
          class="text-xs text-success flex flex--center gap-1"
        >
          <Icon icon="check-circle" /> تم الحفظ
        </span>
      </transition>
    </CardHeader>
    <div class="card__body">
      <textarea
        v-model="notes"
        placeholder="اكتب ملاحظاتك هنا..."
        class="form-control form-control--textarea editable-notes"
        rows="2"
        aria-label="ملاحظات سريعة"
        @input="onNotesInput"
      />
    </div>
  </BaseCard>
</template>

<script setup>
import { computed, onBeforeUnmount,ref } from 'vue'

import CardHeader from '@/components/ui/CardHeader.vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { debounce } from '@/utils'

const props = defineProps({
  // Parent supplies the current user id. This drops the auth-store import
  // from a "dumb" UI primitive.
  userId: { type: [Number, String], default: null },
})

const notesKey = computed(() => STORAGE_KEYS.DASHBOARD_NOTES(props.userId))
const notes = ref(localStorage.getItem(notesKey.value) || '')
const saved = ref(false)
let savedTimer = null

const saveNotes = debounce(() => {
  localStorage.setItem(notesKey.value, notes.value)
  saved.value = true
  clearTimeout(savedTimer)
  savedTimer = setTimeout(() => { saved.value = false }, 2000)
}, 1000)

function onNotesInput() { saveNotes() }

onBeforeUnmount(() => { clearTimeout(savedTimer) })
</script>
