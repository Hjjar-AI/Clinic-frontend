<template>
  <ResourceFeedback :loading="loading" :error="error" retryable @retry="load" />
  <div v-if="visit" class="clinical-readable">
    <p><strong>{{ visit.patient?.full_name || visit.patient_name }}</strong> · <bdi dir="ltr">{{ visit.visit_date }}</bdi></p>
    <Badge :status="visit.status" status-type="visit" />
    <h3 class="heading-6">الشكوى</h3><p class="clinical-prose">{{ visit.main_complaints || 'غير مسجلة' }}</p>
    <h3 class="heading-6">الأدوية</h3><MedicationList :medications="visit.medications || []" variant="schedule" />
    <h3 class="heading-6">الخطة</h3><p class="clinical-prose">{{ visit.treatment_text || 'غير مسجلة' }}</p>
    <BaseButton :to="{ name: 'VisitDetail', params: { id: visit.id } }">فتح تفاصيل الزيارة</BaseButton>
  </div>
</template>
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import Badge from '@/components/ui/Badge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import MedicationList from '@/features/clinical/components/MedicationList.vue'
import visitService from '@/features/visits/services/visitService'
import { onSessionChange, sessionGeneration } from '@/services/sessionState'
const props = defineProps({ visitId: { type: [String, Number], required: true } })
const visit = ref(null), loading = ref(false), error = ref('')
let generation = 0, disposed = false
function clear() { generation += 1; visit.value = null; loading.value = false; error.value = '' }
const remove = onSessionChange(clear)
onBeforeUnmount(() => { disposed = true; clear(); remove() })
watch(() => props.visitId, () => { clear(); load() }, { immediate: true })
async function load() {
  const request = ++generation, epoch = sessionGeneration()
  loading.value = true; error.value = ''
  try { const result = await visitService.getById(props.visitId); if (!disposed && request === generation && epoch === sessionGeneration()) visit.value = result }
  catch { if (!disposed && request === generation && epoch === sessionGeneration()) error.value = 'تعذر تحميل تفاصيل الزيارة' }
  finally { if (!disposed && request === generation && epoch === sessionGeneration()) loading.value = false }
}
</script>
