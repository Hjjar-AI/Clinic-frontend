<template>
  <div class="statistics-view">
    <Breadcrumb />
    <PageHeader
      title="لوحة الإحصائيات"
      subtitle="مؤشرات الأداء الرئيسية والتحليلات البيانية."
    >
      <div class="flex gap-2">
        <BaseButton
          v-if="authStore.user?.role === 'admin'"
          variant="secondary"
          size="sm"
          :to="{ name: 'Reconciliation' }"
        >
          <Icon icon="scale-balanced" /> مطابقة السجلات
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          :loading="downloadingSummary"
          @click="$emit('download-monthly')"
        >
          <Icon icon="file-alt" /> ملخص شهري
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          :loading="downloadingPerformance"
          @click="$emit('download-doctor-performance')"
        >
          <Icon icon="user-md" /> أداء الأطباء
        </BaseButton>
        <a
          :href="excelExportUrl"
          class="btn btn--success"
        >
          <Icon icon="file-excel" /> تصدير Excel
        </a>
      </div>
    </PageHeader>

    <DateRangePicker
      class="mb-4"
      :start-date="filters.dateFrom"
      :end-date="filters.dateTo"
      @update:start-date="$emit('update:dateFrom', $event)"
      @update:end-date="$emit('update:dateTo', $event)"
      @apply="$emit('apply-date-filter')"
      @clear="$emit('clear-date-filter')"
    />

    <KpiGrid
      :items="kpiItems"
      :cols="4"
    />

    <KpiGrid :items="secondKpiItems" :cols="4" />

    <div class="grid-2 mb-4">
      <StatisticsChart
        v-for="def in chartDefs"
        :key="def.id"
        :chart-def="def"
        :stats="stats"
        :months-labels="monthsLabels"
        :visits-counts="visitsCounts"
      />
    </div>

    <div class="grid-4 mb-4">
      <StatCard
        icon="tasks"
        label="مهام مكتملة"
        :value="toArabic(stats.completed_tasks)"
        type="primary"
      />
      <StatCard
        icon="calendar-check"
        label="مواعيد اليوم"
        :value="toArabic(stats.appointments_today)"
        type="success"
      />
      <StatCard
        icon="calendar-week"
        label="مواعيد الأسبوع"
        :value="toArabic(stats.appointments_week)"
        type="purple"
      />
      <StatCard
        icon="tasks"
        label="مهام معلقة"
        :value="toArabic(stats.pending_tasks)"
        type="warning"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import StatisticsChart from '@/components/charts/StatisticsChart.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import KpiGrid from '@/components/ui/KpiGrid.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useFormatters } from '@/composables/useFormatters'
import { useAuthStore } from '@/features/auth/stores/auth'

const { toArabicNumerals: toArabic } = useFormatters()
const authStore = useAuthStore()

const props = defineProps({
  downloadingSummary: { type: Boolean, default: false },
  downloadingPerformance: { type: Boolean, default: false },
  filters: { type: Object, required: true },
  kpiItems: { type: Array, required: true },
  secondKpiItems: { type: Array, required: true },
  chartDefs: { type: Array, required: true },
  stats: { type: Object, required: true },
  monthsLabels: { type: Array, required: true },
  visitsCounts: { type: Array, required: true },
})

defineEmits([
  'download-monthly', 'download-doctor-performance',
  'update:dateFrom', 'update:dateTo', 'apply-date-filter', 'clear-date-filter'
])

const excelExportUrl = computed(() => {
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  const params = new URLSearchParams()
  if (props.filters.dateFrom) params.set('date_from', props.filters.dateFrom)
  if (props.filters.dateTo) params.set('date_to', props.filters.dateTo)
  const query = params.toString()
  return `${base}/exports/reports/excel/${query ? `?${query}` : ''}`
})
</script>

<style scoped src="../../../styles/features/reports/components/statistics-layout.css"></style>
