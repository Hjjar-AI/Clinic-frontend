<template>
  <CollectionPanel title="النسخ السابقة المعتمدة" :resource-key="visitId" :read="visitService.revisions" v-slot="{ items }">
    <article v-for="revision in items" :key="revision.id" class="border-bottom p-2">
      <details>
        <summary>النسخة {{ revision.number }} · {{ revision.signer_name }} · <DateCell :date="revision.signed_at" show-time :relative="false" /></summary>
        <p v-if="revision.reason">{{ revision.reason }}</p>
        <SnapshotValue :value="revision.snapshot" />
      </details>
    </article>
  </CollectionPanel>
  <CollectionPanel title="المستندات الصادرة" :resource-key="visitId" :read="visitService.issuedDocuments" v-slot="{ items }">
    <ResourceFeedback :error="downloadError" />
    <article v-for="document in items" :key="document.id" class="border-bottom p-2 flex gap-2 flex--wrap">
      <span>{{ document.document_type === 'prescription' ? 'وصفة طبية' : 'خطاب تحويل' }} · النسخة {{ document.revision_number }} · {{ document.issued_by_name }}</span>
      <DateCell :date="document.issued_at" show-time :relative="false" />
      <BaseButton :disabled="downloading" @click="download(document)">تنزيل الأصل</BaseButton>
    </article>
  </CollectionPanel>
</template>
<script setup>
import { ref } from 'vue'
import CollectionPanel from '@/components/common/CollectionPanel.vue'
import DateCell from '@/components/ui/DateCell.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import SnapshotValue from '@/features/visits/components/SnapshotValue.vue'
import visitService from '@/features/visits/services/visitService'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { downloadBlob } from '@/utils/download'
defineProps({ visitId: { type: [String, Number], required: true } })
const downloading = ref(false), downloadError = ref('')
async function download(document) {
  if (downloading.value) return
  downloading.value = true; downloadError.value = ''
  try { const response = await prescriptionService.issuedPdf(document.id); downloadBlob(response.data, `${document.document_type}_${document.id}.pdf`) }
  catch { downloadError.value = 'تعذر تنزيل المستند المحفوظ.' }
  finally { downloading.value = false }
}
</script>
