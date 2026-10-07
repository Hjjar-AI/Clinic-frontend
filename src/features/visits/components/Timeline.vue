<template>
  <VerticalEventList
    :columns="columns"
    :items="visits"
  >
    <template #badge="{ item: visit }">
      <div
        class="timeline__badge"
        :class="`timeline__badge--${visitRiskColor(visit)}`"
      >
        <Icon :icon="visitRiskIcon(visit)" />
      </div>
    </template>
    <template #date="{ item: visit }">
      {{ formatDate(visit.visit_date) }}
    </template>
    <template #title>
      زيارة طبية
    </template>
    <template #detail="{ item: visit }">
      {{ visit.main_complaints?.substring(0, 100) }}
    </template>
    <template #actions="{ item: visit }">
      <router-link
        :to="`/visits/${visit.id}/edit`"
        class="btn btn--secondary btn--small"
      >
        عرض
      </router-link>
    </template>
  </VerticalEventList>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
import VerticalEventList from '@/components/ui/VerticalEventList.vue'
import { useDate } from '@/composables/useDate'
import { getRiskInfo } from '@/utils/riskLevels'

defineProps({ visits: { type: Array, default: () => [] } })

const { formatDate } = useDate()

function visitRiskColor(visit) {
  const suicide = getRiskInfo(visit.suicide_risk_level).color
  const violence = getRiskInfo(visit.violence_risk_level).color
  if (suicide === 'danger' || violence === 'danger') return 'danger'
  if (suicide === 'warning' || violence === 'warning') return 'warning'
  return 'primary'
}

function visitRiskIcon(visit) {
  const suicide = getRiskInfo(visit.suicide_risk_level).icon
  const violence = getRiskInfo(visit.violence_risk_level).icon
  if (suicide === 'exclamation-triangle' || violence === 'exclamation-triangle') return 'exclamation-triangle'
  if (suicide === 'exclamation-circle' || violence === 'exclamation-circle') return 'exclamation-circle'
  return 'calendar-day'
}

const columns = [
  { key: 'badge',   label: '',        class: 'timeline__badge-cell' },
  { key: 'date',    label: 'التاريخ', class: 'text-xs text-muted' },
  { key: 'title',   label: 'العنوان', class: 'font-semibold text-sm' },
  { key: 'detail',  label: 'التفاصيل',class: 'text-xs text-soft' },
  { key: 'actions', label: '',        class: 'timeline__actions-cell' },
]
</script>