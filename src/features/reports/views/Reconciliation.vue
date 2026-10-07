<template>
  <div>
    <Breadcrumb :items="[{ label: 'التقارير', to: { name: 'Statistics' } }, { label: 'مطابقة السجلات' }]" />
    <PageHeader
      title="مطابقة السجلات"
      :subtitle="metaText"
    >
      <BaseButton
        variant="secondary"
        :loading="loading"
        @click="load"
      >
        <Icon icon="refresh" /> تحديث
      </BaseButton>
    </PageHeader>

    <KpiGrid
      :items="kpis"
      :cols="5"
    />

    <div class="grid-2 mt-4">
      <BaseCard
        v-for="section in sections"
        :key="section.key"
      >
        <CardHeader :title="section.label" />
        <div class="card__body">
          <div
            v-for="(count, status) in section.byStatus"
            :key="status"
            class="flex flex--justify-between border-bottom py-2"
          >
            <span>{{ statusLabel(section.key, status) }}</span>
            <strong>{{ toArabic(count) }}</strong>
          </div>
          <p
            v-if="section.key === 'invoices'"
            class="text-sm text-muted mt-2"
          >
            الإيراد المحسوب: {{ formatMoney(data.invoices?.paid_amount || 0) }}.
            {{ data.invoices?.revenue_definition }}
          </p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import KpiGrid from '@/components/ui/KpiGrid.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useFormatters } from '@/composables/useFormatters'
import statisticsService from '@/features/reports/services/statisticsService'

const data = ref({})
const loading = ref(false)
const { formatMoney, toArabicNumerals: toArabic } = useFormatters()

const labels = {
  visits: { draft: 'مسودة', final: 'نهائية', amended: 'معدلة', locked: 'مقفلة' },
  appointments: { scheduled: 'مجدول', confirmed: 'مؤكد', arrived: 'وصل', completed: 'مكتمل', cancelled: 'ملغي', 'no-show': 'لم يحضر' },
  tasks: { open: 'مفتوحة', in_progress: 'قيد التنفيذ', completed: 'مكتملة', cancelled: 'ملغية' },
  invoices: { draft: 'مسودة', issued: 'صادرة', paid: 'مدفوعة', cancelled: 'ملغاة' },
}

const kpis = computed(() => [
  { icon: 'users', label: 'المرضى', value: toArabic(data.value.patients?.total || 0), type: 'patients' },
  { icon: 'notes-medical', label: 'الزيارات', value: toArabic(data.value.visits?.total || 0), type: 'visits' },
  { icon: 'calendar', label: 'المواعيد', value: toArabic(data.value.appointments?.total || 0), type: 'appointments' },
  { icon: 'tasks', label: 'المهام', value: toArabic(data.value.tasks?.total || 0), type: 'tasks' },
  { icon: 'file-invoice', label: 'الفواتير', value: toArabic(data.value.invoices?.total || 0), type: 'billing' },
])

const sections = computed(() => [
  { key: 'visits', label: 'الزيارات حسب الحالة', byStatus: data.value.visits?.by_status || {} },
  { key: 'appointments', label: 'المواعيد حسب الحالة', byStatus: data.value.appointments?.by_status || {} },
  { key: 'tasks', label: 'المهام حسب الحالة', byStatus: data.value.tasks?.by_status || {} },
  { key: 'invoices', label: 'الفواتير حسب الحالة', byStatus: data.value.invoices?.by_status || {} },
])

const metaText = computed(() => {
  const meta = data.value._meta
  return meta ? `${meta.scope} • ${meta.timezone}` : 'تحقق إداري سريع من تطابق القوائم والتقارير.'
})

function statusLabel(section, status) {
  return labels[section]?.[status] || status
}

async function load() {
  loading.value = true
  try {
    data.value = await statisticsService.getReconciliation()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
