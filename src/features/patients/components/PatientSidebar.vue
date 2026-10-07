<!-- frontend/src/features/patients/components/PatientSidebar.vue -->
<template>
  <aside class="profile-sidebar">
    <div
      v-if="!patient.completeness?.complete"
      class="card card--compact mb-3"
    >
      <CardHeader
        variant="warning"
        icon="exclamation-circle"
        title="ملف غير مكتمل"
      />
      <div class="card__body">
        <p class="text-sm mb-1">
          اكتمال البيانات: {{ patient.completeness?.percent || 0 }}%
        </p>
        <p class="text-xs text-muted m-0">
          الحقول الناقصة: {{ missingFields }}
        </p>
      </div>
    </div>
    <div class="card card--compact mb-3">
      <CardHeader
        variant="neutral"
        icon="family"
        title="التاريخ العائلي"
      />
      <div class="card__body">
        <p class="text-sm">
          {{ patient.family_history || 'لا يوجد' }}
        </p>
      </div>
    </div>
    <div class="card card--compact mb-3">
      <CardHeader
        variant="neutral"
        icon="exclamation-triangle"
        title="ملاحظات هامة"
      />
      <div class="card__body">
        <p class="text-sm">
          {{ patient.important_notes || 'لا يوجد' }}
        </p>
      </div>
    </div>
    <div
      v-if="latestVisit"
      class="card card--compact mb-3"
    >
      <CardHeader
        variant="neutral"
        icon="shield-alt"
        title="أحدث تقييم مخاطر"
      />
      <div class="card__body">
        <div class="flex flex--justify-between mb-1">
          <span class="text-sm text-muted">خطر الانتحار</span>
          <RiskLevelBadge :level="latestVisit.suicide_risk_level" />
        </div>
        <div class="flex flex--justify-between mb-1">
          <span class="text-sm text-muted">خطر العنف</span>
          <RiskLevelBadge
            :level="latestVisit.violence_risk_level"
            type="violence"
          />
        </div>
        <div
          v-if="latestVisit.firearm_access"
          class="mt-2 p-2 rounded bg-danger-light"
        >
          <span class="text-xs text-danger font-bold">⚠ حيازة سلاح ناري</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

import CardHeader from '@/components/ui/CardHeader.vue'
import RiskLevelBadge from '@/features/clinical/components/RiskLevelBadge.vue'

const props = defineProps({
  patient: { type: Object, required: true },
  latestVisit: { type: Object, default: null }
})

const missingFields = computed(() => {
  const labels = {
    dob_year: 'سنة الميلاد',
    gender: 'الجنس',
    national_id: 'الرقم الوطني',
    phone: 'الهاتف',
    doctor: 'الطبيب المسؤول',
    admission_date: 'تاريخ الإضافة',
  }
  return (props.patient.completeness?.missing_fields || [])
    .map((field) => labels[field] || field)
    .join('، ')
})
</script>
