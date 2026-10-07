<template>
  <StatisticsLayout
    :downloading-summary="downloadingSummary"
    :downloading-performance="downloadingPerformance"
    :filters="filters"
    :kpi-items="kpiItems"
    :second-kpi-items="secondKpiItems"
    :chart-defs="chartDefs"
    :stats="stats"
    :months-labels="monthsLabels"
    :visits-counts="visitsCounts"
    @download-monthly="downloadMonthlySummary"
    @download-doctor-performance="downloadDoctorPerformance"
    @update:date-from="filters.dateFrom = $event"
    @update:date-to="filters.dateTo = $event"
    @apply-date-filter="fetchData"
    @clear-date-filter="clearDateFilter"
  />
</template>

<script setup>
import { computed, onMounted,reactive } from 'vue'

import { useApi } from '@/composables/useApi'
import { useFormatters } from '@/composables/useFormatters'
import StatisticsLayout from '@/features/reports/components/StatisticsLayout.vue'
import statisticsService from '@/features/reports/services/statisticsService'

const { toArabicNumerals: toArabic } = useFormatters()

const filters = reactive({ dateFrom: '', dateTo: '' })
const stats = reactive({
  total_patients: 0, total_visits: 0, total_appointments: 0,
  male_count: 0, female_count: 0, avg_age: 0, avg_visits_per_patient: 0,
  completed_tasks: 0, pending_tasks: 0, appointments_today: 0,
  appointments_week: 0, top_diagnosis: null, top_medication: null,
  age_labels: [], age_counts: [], marital_labels: [], marital_counts: [],
  level_labels: [], level_counts: [], med_labels: [], med_counts: [],
  risk_labels: [], risk_counts: [], status_labels: [], status_data: [],
  patients_acquisition: [], completed_followups: 0, overdue_followups: 0,
  patients_acquisition_labels: [],
})
const monthsLabels = reactive([])
const visitsCounts = reactive([])

const kpiItems = computed(() => [
  { icon: 'users', label: 'إجمالي المرضى', value: toArabic(stats.total_patients), type: 'patients' },
  { icon: 'venus-mars', label: 'الذكور', value: toArabic(stats.male_count), subtitle: 'إناث: ' + toArabic(stats.female_count), type: 'info' },
  { icon: 'birthday-cake', label: 'متوسط العمر', value: toArabic(stats.avg_age), subtitle: 'سنة', type: 'info' },
  { icon: 'chart-line', label: 'زيارات / مريض', value: toArabic(stats.avg_visits_per_patient), type: 'visits' },
])

const secondKpiItems = computed(() => [
  { icon: 'stethoscope', label: 'إجمالي الزيارات', value: toArabic(stats.total_visits), type: 'visits' },
  { icon: 'calendar-alt', label: 'المواعيد', value: toArabic(stats.total_appointments), type: 'appointments' },
  { icon: 'pills', label: 'أكثر دواء', value: toArabic(topMedicationCount), subtitle: topMedicationName, type: 'warning' },
  { icon: 'diagnoses', label: 'أكثر تشخيص', value: toArabic(topDiagnosisCount), subtitle: topDiagnosisName, type: 'danger' },
])

const topMedication = computed(() => {
  if (Array.isArray(stats.top_medication) && stats.top_medication.length >= 2)
    return { name: stats.top_medication[0] || '—', count: stats.top_medication[1] || 0 }
  return { name: '—', count: 0 }
})
const topMedicationName = computed(() => topMedication.value.name)
const topMedicationCount = computed(() => topMedication.value.count)

const topDiagnosis = computed(() => {
  if (Array.isArray(stats.top_diagnosis) && stats.top_diagnosis.length >= 2)
    return { name: stats.top_diagnosis[0] || '—', count: stats.top_diagnosis[1] || 0 }
  return { name: '—', count: 0 }
})
const topDiagnosisName = computed(() => topDiagnosis.value.name)
const topDiagnosisCount = computed(() => topDiagnosis.value.count)

const chartDefs = [
  { id: 'genderChart',   type: 'doughnut', title: 'توزيع الجنسين', icon: 'venus-mars', labels: () => ['ذكر','أنثى'], data: () => [stats.male_count, stats.female_count], colors: 2, options: { cutout: '65%', legend: true } },
  { id: 'ageChart',      type: 'bar',      title: 'التوزيع العمري', icon: 'birthday-cake', labels: () => stats.age_labels, data: () => stats.age_counts || [], colors: () => stats.age_labels.length, options: { legend: false } },
  { id: 'maritalChart',  type: 'doughnut', title: 'الحالة الاجتماعية', icon: 'ring', labels: () => stats.marital_labels, data: () => stats.marital_counts || [], colors: () => stats.marital_labels.length, options: { cutout: '65%', legend: true } },
  { id: 'levelChart',    type: 'doughnut', title: 'مستوى الرعاية', icon: 'hospital', labels: () => stats.level_labels, data: () => stats.level_counts || [], colors: () => stats.level_labels.length, options: { cutout: '65%', legend: true } },
  { id: 'visitsTrendChart', type: 'line',  title: 'الزيارات الشهرية', icon: 'chart-line', labels: () => monthsLabels, data: () => visitsCounts, colors: 1, options: { fill: true } },
  { id: 'acquisitionChart', type: 'bar',   title: 'اكتساب المرضى', icon: 'user-plus', labels: () => stats.patients_acquisition_labels, data: () => stats.patients_acquisition, colors: 1 },
  { id: 'medicationsChart', type: 'bar',   title: 'أكثر 10 أدوية', icon: 'pills', labels: () => stats.med_labels, data: () => stats.med_counts || [], colors: () => stats.med_labels.length, options: { legend: false } },
  { id: 'riskChart',      type: 'doughnut', title: 'خطر الانتحار', icon: 'shield-alt', labels: () => stats.risk_labels, data: () => stats.risk_counts || [], colors: () => stats.risk_labels.length, options: { cutout: '65%', legend: true } },
  { id: 'followupChart',  type: 'doughnut', title: 'الالتزام بالمتابعة', icon: 'heartbeat', labels: ['مكتمل','متأخر'], data: () => [stats.completed_followups, stats.overdue_followups], colors: 2, options: { cutout: '65%', legend: true } },
  { id: 'statusChart',    type: 'bar',      title: 'حالة الزيارات', icon: 'clipboard-check', labels: () => stats.status_labels, data: () => stats.status_data || [], colors: 1 },
]

async function fetchData() {
  const data = await statisticsService.getStatistics({
    date_from: filters.dateFrom,
    date_to: filters.dateTo
  })
  // `data` is already the inner data object (no extra wrapper)
  const inner = data

  if (inner.followup_stats) {
    inner.completed_followups = inner.followup_stats.completed || 0
    inner.overdue_followups = inner.followup_stats.overdue || 0
    delete inner.followup_stats
  }
  Object.assign(stats, inner)
  monthsLabels.splice(0, monthsLabels.length, ...(inner.months_labels || []))
  visitsCounts.splice(0, visitsCounts.length, ...(inner.visits_counts || []))
  stats.patients_acquisition = inner.patients_acquisition || []
  stats.patients_acquisition_labels = inner.patients_acquisition_labels || []
}

function clearDateFilter() {
  filters.dateFrom = ''
  filters.dateTo = ''
  fetchData()
}

const { loading: downloadingSummary, execute: doSummary } = useApi(async () => {
  const now = new Date()
  const data = await statisticsService.getMonthlySummary(now.getFullYear(), now.getMonth() + 1)
  // `data` is already the inner summary object
  downloadJsonAsFile(data, `monthly_summary_${now.getFullYear()}_${now.getMonth()+1}.json`)
})

const { loading: downloadingPerformance, execute: doPerformance } = useApi(async () => {
  const data = await statisticsService.getDoctorPerformance()
  downloadJsonAsFile(data, 'doctor_performance.json')
})

const downloadMonthlySummary = () => doSummary()
const downloadDoctorPerformance = () => doPerformance()

function downloadJsonAsFile(json, filename) {
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

onMounted(fetchData)
</script>
