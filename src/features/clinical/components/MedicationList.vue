<template>
  <div
    v-if="variant === 'schedule'"
    class="medication-schedule"
  >
    <div
      v-for="(med, idx) in medications"
      :key="idx"
      class="medication-schedule__item"
    >
      <div class="medication-schedule__header">
        <Icon
          icon="pills"
          class="medication-schedule__icon"
        />
        <span class="medication-schedule__name">{{ med.name }}</span>
        <Badge
          v-if="med.controlled"
          status="controlled"
          status-type="medication"
          size="xs"
          variant="soft"
        />
      </div>
      <div class="medication-schedule__details">
        <span
          v-if="med.dosage"
          class="medication-schedule__dosage"
        >{{ med.dosage }}</span>
        <span
          v-if="med.brand"
          class="medication-schedule__brand"
        >({{ med.brand }})</span>
      </div>
      <div
        v-if="med.schedule"
        class="medication-schedule__frequency"
      >
        <Icon
          icon="clock"
          class="text-muted"
        />
        <span>{{ med.schedule }}</span>
      </div>
      <div
        v-if="med.instructions"
        class="medication-schedule__instructions"
      >
        {{ med.instructions }}
      </div>
    </div>
  </div>
  <div
    v-else-if="variant === 'prescription'"
    class="prescription-block"
  >
    <h5 class="prescription-block__title">
      الأدوية الموصوفة
    </h5>
    <div class="prescription-block__list">
      <div
        v-for="(med, idx) in medications"
        :key="idx"
        class="prescription-item"
      >
        <div class="prescription-item__name">
          {{ med.name }}
        </div>
        <div class="prescription-item__details">
          <span
            v-if="med.dosage"
            class="prescription-item__dosage"
          >{{ med.dosage }}</span>
          <span
            v-if="med.schedule"
            class="prescription-item__schedule"
          >{{ med.schedule }}</span>
          <span
            v-if="med.date"
            class="prescription-item__date numeric"
          >{{ med.date }}</span>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else-if="variant === 'pill'"
    class="medication-pills"
  >
    <span
      v-for="(med, idx) in medications"
      :key="idx"
      class="tag tag--primary-soft medication-pill"
    >
      <span class="medication-pill__name">{{ med.name }}</span>
      <span
        v-if="med.dosage"
        class="medication-pill__dosage"
      >{{ med.dosage }}</span>
      <span
        v-if="med.schedule"
        class="medication-pill__schedule"
      >{{ med.schedule }}</span>
    </span>
  </div>
</template>

<script setup>
import Badge from '@/components/ui/Badge.vue'
import Icon from '@/components/ui/Icon.vue'

defineProps({
  medications: { type: Array, required: true },
  variant: { type: String, default: 'schedule', validator: v => ['schedule', 'prescription', 'pill'].includes(v) }
})
</script>