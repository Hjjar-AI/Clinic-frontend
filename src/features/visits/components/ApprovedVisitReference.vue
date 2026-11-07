<template>
  <aside
    class="approved-visit-reference clinical-readable"
    aria-label="مرجع سريري معتمد"
  >
    <h2 class="heading-5">
      آخر سجل معتمد — للقراءة فقط
    </h2>
    <ResourceFeedback
      :loading="loading"
      :error="error"
      retryable
      @retry="load"
    />
    <template v-if="data">
      <p>
        زيارة #{{ data.visit_id }} · نسخة {{ data.revision_number }} ·
        <bdi dir="ltr">{{ data.fields.visit_date }}</bdi>
      </p>
      <p>
        تاريخ الاعتماد:
        <DateCell
          :date="data.signed_at"
          :relative="false"
          show-time
        />
      </p>
      <h3 class="heading-6">
        الشكوى
      </h3>
      <p class="clinical-prose">
        {{ data.fields.main_complaints || 'غير مسجلة' }}
      </p>
      <h3 class="heading-6">
        الفحص
      </h3>
      <p class="clinical-prose">
        {{ data.fields.clinical_data?.mse || 'غير مسجل' }}
      </p>
      <h3 class="heading-6">
        المخاطر في السجل المعتمد
      </h3>
      <div class="flex flex--wrap gap-2">
        <RiskLevelBadge
          :level="data.fields.suicide_risk_level"
        /><RiskLevelBadge
          :level="data.fields.violence_risk_level"
          type="violence"
        />
      </div>
      <h3 class="heading-6">
        الأدوية
      </h3>
      <MedicationList
        :medications="data.medications"
        variant="schedule"
      />
      <h3 class="heading-6">
        الخطة
      </h3>
      <p class="clinical-prose">
        {{ data.fields.treatment_text || 'غير مسجلة' }}
      </p>
      <BaseButton
        size="sm"
        :to="{ name: 'VisitDetail', params: { id: data.visit_id } }"
      >
        فتح الزيارة المعتمدة
      </BaseButton>
    </template>
    <p v-else-if="!loading && !error">
      لا يوجد سجل معتمد سابق متاح.
    </p>
  </aside>
</template>
<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import DateCell from '@/components/ui/DateCell.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useLatestResource } from '@/composables/useLatestResource'
import MedicationList from '@/features/clinical/components/MedicationList.vue'
import RiskLevelBadge from '@/features/clinical/components/RiskLevelBadge.vue'
import visitService from '@/features/visits/services/visitService'
const props = defineProps({
  patientId: { type: [String, Number], required: true },
  excludeVisit: { type: [String, Number], default: null },
})
const {
  data: data,
  loading,
  error,
  load,
} = useLatestResource(
  () => [props.patientId, props.excludeVisit],
  ([patientId, excludeVisit]) =>
    visitService.approvedReference(patientId, excludeVisit),
  'تعذر تحميل المرجع المعتمد',
)
</script>
