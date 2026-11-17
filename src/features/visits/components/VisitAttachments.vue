<template>
  <CollectionPanel
    ref="panel"
    title="مرفقات الزيارة"
    :resource-key="visit.id"
    :read="visitService.attachments"
    v-slot="{ items }"
  >
    <p v-if="!editable">
      مرفقات الزيارة المعتمدة للقراءة فقط؛ افتح تعديلاً موثقاً لتغييرها.
    </p>
    <label
      v-if="editable"
      :for="fileId"
      class="mb-3"
    >إضافة ملفات
      <input
        :id="fileId"
        ref="input"
        type="file"
        multiple
        :disabled="busy || pendingFiles.length > 0"
        @change="choose($event.target.files)"
      >
    </label>
    <BaseButton
      v-if="pendingFiles.length && !busy"
      @click="upload"
    >
      إعادة نفس الطلب للملفات المتبقية
    </BaseButton>
    <ResourceFeedback
      :loading="busy"
      :error="writeError"
      loading-text="جاري رفع الملفات؛ يرجى الانتظار…"
    />
    <article
      v-for="file in items"
      :key="file.id"
      class="border-bottom p-2 flex gap-2 flex--wrap"
    >
      <span>{{ file.original_filename }}</span>
      <BaseButton
        :disabled="busy"
        @click="download(file)"
      >
        تنزيل
      </BaseButton>
      <BaseButton
        v-if="editable"
        :disabled="busy"
        @click="remove(file)"
      >
        إزالة
      </BaseButton>
    </article>
  </CollectionPanel>
</template>
<script setup>
import { computed, ref, useId,watch } from 'vue'

import CollectionPanel from '@/components/common/CollectionPanel.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/features/auth/stores/auth'
import visitService from '@/features/visits/services/visitService'
import { downloadBlob } from '@/utils/download'
const fileId = `visit-files-${useId()}`
const props = defineProps({ visit: { type: Object, required: true } })
const emit = defineEmits(['changed'])
const auth = useAuthStore()
const { confirm } = useConfirmDialog()
const panel = ref(null), input = ref(null), busy = ref(false), writeError = ref(''), pendingFiles = ref([])
let version = props.visit.version
watch(() => props.visit.version, value => { if (!busy.value) version = value })
const editable = computed(() => auth.can('manage_patient_documents') && ['draft', 'amended'].includes(props.visit.status))
function choose(files) { pendingFiles.value = Array.from(files || []); upload() }
async function upload() {
  if (busy.value || !editable.value) return
  busy.value = true; writeError.value = ''
  try {
    while (pendingFiles.value.length) {
      const file = pendingFiles.value[0]
      const result = await visitService.uploadAttachment(props.visit.id, file, version)
      version = result.version
      pendingFiles.value.shift()
      emit('changed', version)
    }
    input.value.value = ''
    await panel.value.reload()
  } catch { writeError.value = 'تعذر تأكيد رفع جميع الملفات؛ احتفظ بالملفات وأعد نفس الطلب للتحقق بأمان.' }
  finally { busy.value = false }
}
async function remove(file) {
  if (busy.value || !await confirm('إزالة المرفق من الزيارة الحالية مع الاحتفاظ بالتاريخ؟')) return
  busy.value = true; writeError.value = ''
  try { version = await visitService.removeAttachment(props.visit.id, file.id, version); emit('changed', version); await panel.value.reload() }
  catch { writeError.value = 'تعذر تأكيد إزالة المرفق.' }
  finally { busy.value = false }
}
async function download(file) {
  try { const response = await visitService.attachmentPdf(props.visit.id, file.id); downloadBlob(response.data, file.original_filename) }
  catch { writeError.value = 'تعذر تنزيل المرفق.' }
}
</script>
