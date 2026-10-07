<template>
  <component
    :is="compact ? 'div' : 'router-link'"
    :to="!compact ? `/visits/${visit.id}` : undefined"
    :role="compact ? 'button' : undefined"
    :tabindex="compact ? 0 : undefined"
    class="visit-card-wrapper"
    :class="{ 'visit-card-link': !compact }"
    @click="compact && $emit('click')"
    @keydown.enter.prevent="compact && $emit('click')"
    @keydown.space.prevent="compact && $emit('click')"
  >
    <div
      class="visit-card"
      :class="[
        compact ? 'visit-card--compact' : '',
        `visit-card--status-${statusColor}`
      ]"
    >
      <div class="visit-card__header">
        <div class="visit-card__date">
          <template v-if="compact">
            <span class="visit-card__day">{{ formatDate(visit.visit_date) }}</span>
          </template>
          <template v-else>
            {{ formatDate(visit.visit_date) }}
          </template>
        </div>
        <div class="visit-card__meta">
          <RiskLevelBadge
            v-if="!compact"
            :level="visit.suicide_risk_level"
          />
          <RiskLevelBadge
            v-if="compact && visit.suicide_risk_level"
            :level="visit.suicide_risk_level"
            type="suicide"
            size="xs"
          />
        </div>
      </div>
      <div class="visit-card__body">
        <div class="visit-card__diagnosis">
          <DiagnosisList
            :diagnoses="visit.diagnoses || []"
            variant="full"
          />
        </div>
        <div class="visit-card__complaint">
          {{ compact ? visit.main_complaints?.substring(0, 80) + (visit.main_complaints?.length > 80 ? '…' : '') : visit.main_complaints?.substring(0, 120) }}
        </div>
      </div>
      <div
        v-if="!compact && visit.last_assessed_date"
        class="visit-card__footer"
      >
        <RelativeDate
          :date="visit.last_assessed_date"
          icon="clock"
          label="آخر تقييم:"
        />
      </div>
      <div
        v-if="compact && $slots.actions"
        class="visit-card__actions"
        @click.stop
      >
        <slot name="actions" />
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'

import RelativeDate from '@/components/ui/RelativeDate.vue'
import { useDate } from '@/composables/useDate'
import DiagnosisList from '@/features/clinical/components/DiagnosisList.vue'
import RiskLevelBadge from '@/features/clinical/components/RiskLevelBadge.vue'

const props = defineProps({
  visit: { type: Object, required: true },
  compact: { type: Boolean, default: false }
})

defineEmits(['click'])

const { formatDate } = useDate()

const statusColor = computed(() => {
  const status = props.visit.status?.trim() || ''
  const map = {
    draft: 'info',
    final: 'success',
    amended: 'warning',
    locked: 'primary',
  }
  return map[status] || 'primary'
})
</script>
