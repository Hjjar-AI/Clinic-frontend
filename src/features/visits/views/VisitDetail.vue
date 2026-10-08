<template>
  <PageContainer
    :status="pageStatus"
    @retry="loadVisit"
  >
    <Breadcrumb :items="breadcrumbs" />
    <PageHeader
      title="تفاصيل الزيارة"
      :subtitle="patientName"
    >
      <div class="flex gap-2 flex--wrap">
        <BaseButton
          v-if="authStore.can('edit_visit') && ['draft', 'amended'].includes(visit?.status)"
          variant="secondary"
          :to="{ name: 'VisitEdit', params: { id: visitId } }"
        >
          تعديل الزيارة
        </BaseButton>
        <BaseButton
          v-if="authStore.can('export_pdf') && visit?.status !== 'draft'"
          variant="secondary"
          :to="{ name: 'PrescriptionPreview', params: { visitId } }"
        >
          روشتة طبية
        </BaseButton>
        <BaseButton
          v-if="authStore.can('view_referrals') && visit?.status !== 'draft'"
          variant="secondary"
          :to="{ name: 'ReferralLetter', params: { visitId } }"
        >
          خطاب تحويل
        </BaseButton>
        <BaseButton
          v-if="authStore.can('edit_visit') && ['draft', 'amended'].includes(visit?.status)"
          variant="success"
          confirm-message="سيتم اعتماد السجل السريري ومنع تعديله مباشرة. هل تريد المتابعة؟"
          @confirmed="transitionVisit('final')"
        >
          اعتماد الزيارة
        </BaseButton>
        <BaseButton
          v-if="authStore.can('edit_visit') && visit?.status === 'final'"
          variant="secondary"
          @click="amendVisit"
        >
          فتح تعديل موثق
        </BaseButton>
        <BaseButton
          v-if="authStore.can('edit_visit') && ['final', 'amended'].includes(visit?.status)"
          variant="danger"
          confirm-message="سيتم قفل الزيارة نهائياً. هل تريد المتابعة؟"
          :confirm-checkbox="true"
          @confirmed="transitionVisit('locked')"
        >
          قفل الزيارة
        </BaseButton>
      </div>
    </PageHeader>

    <div
      v-if="visit"
      class="grid-2 gap-3"
    >
      <BaseCard>
        <CardHeader
          title="ملخص الزيارة"
          icon="clipboard"
        />
        <div class="card__body">
          <KeyValueList :items="summary" />
        </div>
      </BaseCard>
      <BaseCard v-if="visit.scale_responses?.length">
        <CardHeader
          title="المقاييس السريرية"
          icon="chart-line"
        />
        <div class="card__body">
          <div
            v-for="scale in visit.scale_responses"
            :key="scale.scale_id"
            class="mb-3"
          >
            <strong>{{ scale.scale_name_snapshot }}</strong>
            <Badge
              class="mr-2"
              severity="info"
              :label="`الدرجة: ${scale.responses_json?.__score ?? 'غير محدد'}`"
            />
            <ul class="text-sm mt-1">
              <li
                v-for="field in scale.responses_json?.__definition || []"
                :key="field.id"
              >
                {{ field.label }}: {{ scale.responses_json?.[String(field.id)] ?? '-' }}
              </li>
            </ul>
          </div>
        </div>
      </BaseCard>
      <BaseCard v-if="visit.lab_values?.length">
        <CardHeader
          title="نتائج التحاليل"
          icon="flask"
        />
        <div class="card__body">
          <div
            v-for="(lab, index) in visit.lab_values"
            :key="`${lab.name}-${lab.date}-${index}`"
            class="mb-2"
          >
            <strong>{{ lab.name }}</strong>:
            {{ lab.value }} {{ lab.unit || '' }}
            <span class="text-muted">— {{ lab.reference_range || 'دون مجال مرجعي' }} — {{ labStatusLabel(lab.status) }} — {{ lab.date }}</span>
          </div>
        </div>
      </BaseCard>
      <BaseCard>
        <CardHeader
          title="تقييم المخاطر"
          icon="shield"
        />
        <div class="card__body">
          <p><strong>خطر الانتحار:</strong> {{ riskLabel(visit.suicide_risk_level) }}</p>
          <p><strong>خطر العنف:</strong> {{ riskLabel(visit.violence_risk_level) }}</p>
          <p><strong>الوصول إلى سلاح:</strong> {{ visit.firearm_access ? 'نعم' : 'لا' }}</p>
          <p v-if="visit.clinical_data?.risk_notes">
            <strong>ملاحظات:</strong> {{ visit.clinical_data.risk_notes }}
          </p>
        </div>
      </BaseCard>
      <BaseCard>
        <CardHeader
          title="التشخيصات والأدوية"
          icon="stethoscope"
        />
        <div class="card__body">
          <h3 class="heading-6">
            التشخيصات
          </h3>
          <DiagnosisList
            :diagnoses="visit.diagnoses || []"
            variant="full"
          />
          <h3 class="heading-6 mt-3">
            الأدوية
          </h3>
          <MedicationList
            :medications="visit.medications || []"
            variant="schedule"
          />
        </div>
      </BaseCard>
      <BaseCard>
        <CardHeader
          title="الخطة والمتابعة"
          icon="notes"
        />
        <div class="card__body">
          <p><strong>الخطة العلاجية:</strong> {{ visit.treatment_text || '-' }}</p>
          <p><strong>ملاحظات الطبيب:</strong> {{ visit.doctor_notes || '-' }}</p>
          <p><strong>تاريخ المتابعة:</strong> {{ visit.follow_up_date || '-' }}</p>
        </div>
      </BaseCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import PageContainer from '@/components/layout/PageContainer.vue'
import Badge from '@/components/ui/Badge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import KeyValueList from '@/components/ui/KeyValueList.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useNotify } from '@/composables/useNotify'
import { usePageStatus } from '@/composables/usePageStatus'
import { VISIT_STATUS_LABELS } from '@/constants/statusConstants'
import { useAuthStore } from '@/features/auth/stores/auth'
import DiagnosisList from '@/features/clinical/components/DiagnosisList.vue'
import MedicationList from '@/features/clinical/components/MedicationList.vue'
import visitService from '@/features/visits/services/visitService'
import { getRiskInfo } from '@/utils/riskLevels'

const route = useRoute()
const authStore = useAuthStore()
const { notify } = useNotify()
const { prompt } = useConfirmDialog()
const visitId = route.params.id
const visit = ref(null)
const {
  status: pageStatus,
  setLoading,
  setContent,
  setError,
} = usePageStatus()

const patientId = computed(() => visit.value?.patient_id || visit.value?.patient?.id)
const patientName = computed(() => visit.value?.patient?.full_name || visit.value?.patient_name || '')
const breadcrumbs = computed(() => [
  { label: 'المرضى', to: { name: 'PatientsList' } },
  ...(patientId.value ? [{ label: patientName.value || 'المريض', to: { name: 'PatientDetail', params: { id: patientId.value } } }] : []),
  { label: 'تفاصيل الزيارة' },
])
const summary = computed(() => [
  { label: 'التاريخ', value: visit.value?.visit_date || '-' },
  { label: 'الشكوى الرئيسية', value: visit.value?.main_complaints || '-' },
  { label: 'تاريخ الشكوى', value: visit.value?.history_presenting_complaint || '-' },
  { label: 'حالة التوثيق', value: VISIT_STATUS_LABELS[visit.value?.status] || '-' },
  { label: 'الحالة السريرية', value: visit.value?.clinical_status || '-' },
  { label: 'مستوى الألم', value: visit.value?.pain_level ?? '-' },
  { label: 'مستوى القلق', value: visit.value?.anxiety_level ?? '-' },
])

function riskLabel(level) {
  return getRiskInfo(level).label
}

function labStatusLabel(status) {
  return {
    pending: 'قيد الانتظار',
    normal: 'طبيعي',
    abnormal: 'غير طبيعي',
    critical: 'حرج',
  }[status] || status || 'غير محدد'
}

async function transitionVisit(status, reason = '') {
  try {
    visit.value = await visitService.transition(visitId, status, visit.value.version, reason)
    notify('تم تحديث حالة الزيارة', 'success')
  } catch {
    // The shared API layer displays the actionable backend error.
  }
}

async function amendVisit() {
  const reason = await prompt('سيُحفظ سبب فتح السجل مع سجل التغييرات.', {
    title: 'فتح تعديل موثق',
    confirmText: 'فتح التعديل',
    inputLabel: 'سبب التعديل',
  })
  if (!reason) return
  await transitionVisit('amended', reason)
}

async function loadVisit() {
  setLoading()
  try {
    visit.value = await visitService.getById(visitId, 'patient')
    setContent()
  } catch {
    visit.value = null
    setError()
  }
}

onMounted(loadVisit)
</script>
