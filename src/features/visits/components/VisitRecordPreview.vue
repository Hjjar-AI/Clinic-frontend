<template>
  <ResourceFeedback
    :loading="loading"
    :error="error"
    retryable
    @retry="load"
  />
  <div
    v-if="visit"
    class="clinical-readable"
  >
    <p>
      <strong>{{ visit.patient?.full_name || visit.patient_name }}</strong> ·
      <bdi dir="ltr">{{ visit.visit_date }}</bdi>
    </p>
    <Badge
      :status="visit.status"
      status-type="visit"
    />
    <h3 class="heading-6">
      الشكوى
    </h3>
    <p class="clinical-prose">
      {{ visit.main_complaints || 'غير مسجلة' }}
    </p>
    <h3 class="heading-6">
      الأدوية
    </h3>
    <MedicationList
      :medications="visit.medications || []"
      variant="schedule"
    />
    <h3 class="heading-6">
      الخطة
    </h3>
    <p class="clinical-prose">
      {{ visit.treatment_text || 'غير مسجلة' }}
    </p>
    <BaseButton :to="{ name: 'VisitDetail', params: { id: visit.id } }">
      فتح تفاصيل الزيارة
    </BaseButton>
  </div>
</template>
<script setup>
import Badge from '@/components/ui/Badge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useLatestResource } from '@/composables/useLatestResource'
import MedicationList from '@/features/clinical/components/MedicationList.vue'
import visitService from '@/features/visits/services/visitService'
const props = defineProps({
  visitId: { type: [String, Number], required: true },
})
const {
  data: visit,
  loading,
  error,
  load,
} = useLatestResource(
  () => props.visitId,
  (visitId) => visitService.getById(visitId),
  'تعذر تحميل تفاصيل الزيارة',
)
</script>
