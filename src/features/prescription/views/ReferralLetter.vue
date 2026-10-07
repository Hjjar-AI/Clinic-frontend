<!-- frontend/src/features/prescription/views/ReferralLetter.vue -->
<template>
  <BaseCard v-if="visit">
    <LetterSheet
      :clinic-name="clinicName"
      :date="currentDate"
    >
      <h3 style="margin-top:0;">
        خطاب تحويل طبي
      </h3>
      <p><strong>إلى الزميل الفاضل</strong></p>
      <p>نحيل إليكم المريض الموضح بياناته أدناه:</p>

      <div class="panel panel--blue rounded mb-3 p-3">
        <p><strong>المريض:</strong> {{ patientName }}</p>
        <p><strong>تاريخ الزيارة:</strong> <span class="numeric">{{ visit.visit_date }}</span></p>
        <p><strong>الشكوى الرئيسية:</strong> {{ visit.main_complaints }}</p>
        <p>
          <strong>التشخيصات:</strong> <DiagnosisList
            :diagnoses="visit.diagnoses || []"
            variant="full"
          />
        </p>
        <p>
          <strong>الأدوية الحالية:</strong>
          <span
            v-for="(m,i) in visit.medications"
            :key="i"
          >
            {{ m.display_name || m.name }} <span class="tag tag--dose numeric">{{ m.dosage }}</span><span v-if="i < visit.medications.length-1">, </span>
          </span>
        </p>
        <div class="form-group no-print">
          <label for="referral-reason">سبب التحويل</label>
          <textarea
            id="referral-reason"
            v-model.trim="reason"
            class="form-control"
            rows="3"
            required
            @input="reasonError = ''"
          />
          <small
            v-if="reasonError"
            class="text-danger"
          >{{ reasonError }}</small>
        </div>
        <p class="print-only">
          <strong>سبب التحويل:</strong> {{ reason || 'لم يحدد' }}
        </p>
      </div>

      <p style="margin-top:20px;">
        يرجى التكرم بتقديم الرعاية اللازمة.
      </p>
      <p>مع خالص الشكر والتقدير،</p>
      <p><strong>الطبيب المعالج:</strong> _________________</p>
      <p><strong>التاريخ:</strong> <span class="numeric">{{ currentDate }}</span></p>

      <div class="mt-3 text-center no-print">
        <BaseButton
          variant="primary"
          :loading="exporting"
          @click="exportPdf"
        >
          تصدير PDF
        </BaseButton>
      </div>
    </LetterSheet>
  </BaseCard>
</template>

<script setup>
import { computed,onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { useDate } from '@/composables/useDate'
import DiagnosisList from '@/features/clinical/components/DiagnosisList.vue'
import LetterSheet from '@/features/clinical/components/LetterSheet.vue'
import referralService from '@/features/prescription/services/referralService'
import { useSettingsStore } from '@/features/settings/stores/settings'
import { useVisitStore } from '@/features/visits/stores/visits'

const route = useRoute()
const visitStore = useVisitStore()
const settingsStore = useSettingsStore()
const { formatDate } = useDate()
const visitId = route.params.visitId
const visit = ref(null)
const reason = ref(route.query.reason || '')
const reasonError = ref('')
const currentDate = formatDate(new Date())
const clinicName = computed(() => settingsStore.settings.clinic_name || 'عيادة الإتزان')

const patientName = computed(() => visit.value?.patient?.full_name || '')

onMounted(async () => {
  await settingsStore.fetchSettings()
  const result = await visitStore.fetchVisit(visitId, 'patient')
  visit.value = result?.data || result
})

const { loading: exporting, execute: doExportPdf } = useApi(async () => {
  const response = await referralService.generateReferralPdf(visitId, reason.value, visit.value.version)
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = `referral_${visitId}.pdf`
  a.click()
  window.URL.revokeObjectURL(url)
})

async function exportPdf() {
  if (!reason.value) {
    reasonError.value = 'سبب التحويل مطلوب'
    return
  }
  await doExportPdf()
}
</script>

<style scoped>
.print-only { display: none; }
@media print {
  .print-only { display: block; }
}
</style>
