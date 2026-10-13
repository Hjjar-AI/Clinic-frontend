<template>
  <BaseCard>
    <CardHeader title="تسليم سريري من السجل المعتمد" icon="notes" />
    <p>ينقل الشكوى والمخاطر والحساسيات والأدوية والخطة من آخر نسخة موقعة، مع تاريخها. مسودة التعديل لا تدخل الملخص.</p>
    <BaseButton :loading="loading" @click="load">إنشاء ملخص تسليم معتمد</BaseButton>
    <ResourceFeedback :error="error" />
    <PrescriptionPdfPreview v-if="url" :url="url" :filename="`handover_${visitId}.pdf`" document-title="معاينة ملخص التسليم السريري" document-label="ملخص التسليم" />
  </BaseCard>
</template>
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import PrescriptionPdfPreview from '@/features/prescription/components/PrescriptionPdfPreview.vue'
import visitService from '@/features/visits/services/visitService'
import { onSessionChange, sessionGeneration } from '@/services/sessionState'
const props = defineProps({ visitId: { type: [String, Number], required: true } })
const url = ref(''), loading = ref(false), error = ref('')
let generation = 0, disposed = false
function clear() { generation += 1; if (url.value) URL.revokeObjectURL(url.value); url.value = ''; loading.value = false; error.value = '' }
const remove = onSessionChange(clear)
onBeforeUnmount(() => { disposed = true; clear(); remove() })
watch(() => props.visitId, clear)
async function load() {
  if (loading.value) return
  const request = ++generation, epoch = sessionGeneration()
  loading.value = true; error.value = ''
  try {
    const response = await visitService.handoverPdf(props.visitId)
    if (disposed || request !== generation || epoch !== sessionGeneration()) return
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  } catch { if (!disposed && request === generation && epoch === sessionGeneration()) error.value = 'تعذر إنشاء ملخص معتمد؛ تحقق من الاعتماد وصلاحية الوصول' }
  finally { if (!disposed && request === generation && epoch === sessionGeneration()) loading.value = false }
}
</script>
