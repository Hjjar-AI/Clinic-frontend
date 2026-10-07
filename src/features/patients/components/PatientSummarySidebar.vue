<!-- frontend/src/features/patients/components/PatientSummarySidebar.vue -->
<!--
  Moved from `components/ui/` because this component imports
  `@/features/clinical/components/RiskLevelBadge.vue` — a feature-level
  dependency that does not belong to the generic UI layer.
-->
<template>
  <aside class="patient-summary-sidebar">
    <div class="card card--compact">
      <div class="card__body">
        <div class="flex flex--column gap-2">
          <Avatar
            size="lg"
            color="primary"
            :name="displayName"
          />
          <div>
            <h4 class="heading-5 m-0">
              {{ displayName }}
            </h4>
            <p class="text-xs text-muted m-0">
              رقم الملف: #{{ patientId }}
            </p>
          </div>
        </div>
        <hr class="divider my-2">
        <KeyValueList :items="summaryItems" />
        <hr class="divider my-2">
        <div
          v-if="latestRisk"
          class="flex flex--column gap-1"
        >
          <span class="text-xs text-muted">تقييم المخاطر</span>
          <div class="flex flex--gap-2">
            <RiskLevelBadge :level="latestRisk.suicide_risk_level" />
            <RiskLevelBadge
              :level="latestRisk.violence_risk_level"
              type="violence"
            />
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

import Avatar from '@/components/ui/Avatar.vue'
import KeyValueList from '@/components/ui/KeyValueList.vue'
import { useFormatters } from '@/composables/useFormatters'
import RiskLevelBadge from '@/features/clinical/components/RiskLevelBadge.vue'
import { fullName } from '@/utils/normalize'

const props = defineProps({
  patient: { type: Object, required: true },
  latestVisit: { type: Object, default: null }
})

const { formatPhone } = useFormatters()

const displayName = computed(() => fullName(props.patient))
const patientId = computed(() => props.patient?.id || '')

const age = computed(() => {
  if (!props.patient?.dob_year) return null
  return new Date().getFullYear() - parseInt(props.patient.dob_year)
})

const summaryItems = computed(() => [
  { label: 'العمر', value: age.value ? `${age.value} سنة` : '—' },
  { label: 'الجنس', value: props.patient?.gender || '—' },
  { label: 'الهاتف', value: formatPhone(props.patient?.phone) },
  { label: 'آخر زيارة', value: props.latestVisit?.visit_date || '—' },
])

const latestRisk = computed(() => {
  if (!props.latestVisit) return null
  return {
    suicide_risk_level: props.latestVisit.suicide_risk_level,
    violence_risk_level: props.latestVisit.violence_risk_level,
  }
})
</script>

<style scoped>
.patient-summary-sidebar {
  position: sticky;
  top: calc(var(--topbar-height) + var(--space-4));
  width: 260px;
  flex-shrink: 0;
}
/* FIX: var(--breakpoint-lg) → 900px */
@media (max-width: 900px) {
  .patient-summary-sidebar {
    position: static;
    width: 100%;
  }
}
</style>