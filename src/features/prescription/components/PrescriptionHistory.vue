<template>
  <BaseCard role="region" aria-label="تاريخ الوصفات المحفوظة">
    <CardHeader title="تاريخ الوصفات المحفوظة" icon="history" />
    <div class="card__body">
      <p>إعادة الطباعة تستخدم الملف المحفوظ نفسه دون إصدار وصفة جديدة. تعليمات المريض تعرض العلاج وقت إصدار الوصفة، وقد توجد نسخة أحدث.</p>
      <ResourceFeedback :loading="loading" :error="loadError" retryable @retry="loadPage(requestedOffset)" />
      <ResourceFeedback :error="documentError" />
      <p v-if="!loading && !loadError && !items.length">لا توجد وصفات محفوظة.</p>
      <article v-for="item in items" :key="item.id" class="prescription-history-item" :aria-label="`وصفة ${item.id}`">
        <h3>وصفة #{{ item.id }} · نسخة الزيارة {{ item.revision_number }}</h3>
        <p><strong>الإصدار:</strong> <DateCell :date="item.issued_at" :relative="false" show-time /></p>
        <p>{{ item.patient_name }} · {{ item.doctor_name }} · زيارة #{{ item.visit_id }} · <bdi dir="ltr">{{ item.visit_date }}</bdi></p>
        <p>{{ item.medication_count }} دواء · {{ item.print_options?.mode === 'preprinted' ? 'ورق مطبوع' : 'ورق فارغ' }} · <bdi dir="ltr">{{ item.print_options?.width_mm }} × {{ item.print_options?.height_mm }} مم</bdi></p>
        <div class="flex flex--wrap gap-2">
          <BaseButton :disabled="busy || loading" @click="openDocument(item, false)">إعادة طباعة</BaseButton>
          <BaseButton :disabled="busy || loading" @click="openDocument(item, true)">تعليمات المريض</BaseButton>
        </div>
      </article>
      <div v-if="total > 20" class="flex flex--wrap gap-2 mt-3">
        <BaseButton :disabled="loading || busy || offset === 0" @click="loadPage(offset - 20)">السابق</BaseButton>
        <span>{{ offset + 1 }}–{{ Math.min(offset + 20, total) }} من {{ total }}</span>
        <BaseButton :disabled="loading || busy || offset + 20 >= total" @click="loadPage(offset + 20)">التالي</BaseButton>
      </div>
      <p v-if="busy" role="status">جاري تحميل الملف…</p>
      <p v-if="popupBlocked" role="status">تعذر فتح نافذة الطباعة. استخدم أزرار المعاينة أدناه لفتح الملف أو طباعته.</p>
      <p v-if="pdfUrl">الملف المفتوح: {{ isInstructions ? 'تعليمات الوصفة' : 'الوصفة' }} #{{ openedDocumentId }}</p>
      <PrescriptionPdfPreview v-if="pdfUrl" :url="pdfUrl" :filename="filename" :instructions="isInstructions" />
    </div>
  </BaseCard>
</template>
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import DateCell from '@/components/ui/DateCell.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import PrescriptionPdfPreview from '@/features/prescription/components/PrescriptionPdfPreview.vue'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { preparePrintWindow, printSavedPdf } from '@/features/prescription/services/prescriptionPrint'
import { unwrapResponse } from '@/services/apiClient'
import { onSessionChange, sessionGeneration } from '@/services/sessionState'
const props = defineProps({ patientId: { type: [Number, String], required: true }, visitId: { type: [Number, String], default: null }, refreshKey: { type: Number, default: 0 } })
const items = ref([]), total = ref(0), offset = ref(0), requestedOffset = ref(0)
const loading = ref(false), busy = ref(false), loadError = ref(''), documentError = ref('')
const pdfUrl = ref(''), filename = ref(''), isInstructions = ref(false), popupBlocked = ref(false)
const openedDocumentId = ref(null)
let generation = 0, documentGeneration = 0, disposed = false, pendingPopup = null
function clearPdf() {
  documentGeneration += 1
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  pdfUrl.value = ''; openedDocumentId.value = null; documentError.value = ''; busy.value = false; popupBlocked.value = false
  pendingPopup?.close(); pendingPopup = null
}
function reset() { generation += 1; clearPdf(); items.value = []; total.value = 0; loading.value = false; loadError.value = '' }
const removeSessionListener = onSessionChange(reset)
onBeforeUnmount(() => { disposed = true; reset(); removeSessionListener() })
watch(() => [props.patientId, props.visitId, props.refreshKey], () => { reset(); loadPage(0) }, { immediate: true })
async function loadPage(nextOffset) {
  if (loading.value || !props.patientId) return
  const request = ++generation, epoch = sessionGeneration()
  requestedOffset.value = nextOffset; loading.value = true; loadError.value = ''
  try {
    const result = unwrapResponse(await prescriptionService.history(props.patientId, { offset: nextOffset, ...(props.visitId ? { visit_id: props.visitId } : {}) }))
    if (disposed || request !== generation || epoch !== sessionGeneration()) return
    items.value = result.items; total.value = result.total; offset.value = result.offset
  } catch {
    if (!disposed && request === generation && epoch === sessionGeneration()) loadError.value = 'تعذر تحميل تاريخ الوصفات'
  } finally { if (!disposed && request === generation && epoch === sessionGeneration()) loading.value = false }
}
async function openDocument(item, instructions) {
  if (busy.value) return
  clearPdf()
  const request = documentGeneration, epoch = sessionGeneration()
  busy.value = true
  pendingPopup = instructions ? null : preparePrintWindow()
  try {
    const response = await (instructions ? prescriptionService.instructions(item.id) : prescriptionService.savedPdf(item.id))
    if (disposed || request !== documentGeneration || epoch !== sessionGeneration()) return
    pdfUrl.value = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    openedDocumentId.value = item.id
    filename.value = `${instructions ? 'instructions' : 'prescription'}_${item.id}.pdf`
    isInstructions.value = instructions
    if (!instructions) { popupBlocked.value = !printSavedPdf(pdfUrl.value, pendingPopup); pendingPopup = null }
  } catch {
    if (!disposed && request === documentGeneration && epoch === sessionGeneration()) {
      pendingPopup?.close(); pendingPopup = null
      documentError.value = 'تعذر تحميل الملف؛ تحقق من صلاحية الوصول وحاول مجدداً'
    }
  } finally { if (!disposed && request === documentGeneration && epoch === sessionGeneration()) busy.value = false }
}
</script>
<style scoped src="../../../styles/features/prescription/components/prescription-history.css"></style>
