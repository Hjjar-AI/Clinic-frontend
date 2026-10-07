<template>
  <AlertBar
    v-if="statusMsg && !snapshot"
    :severity="statusType"
    :title="statusMsg"
  />
  <BaseCard v-if="snapshot">
    <Breadcrumb :items="breadcrumbs" />
    <CardHeader
      variant="primary"
      icon="prescription"
      title="روشتة طبية"
    />
    <div class="card__body">
      <div class="panel panel--blue rounded mb-3 p-3">
        <p><strong>المريض:</strong> {{ patientName }}</p>
        <p v-if="patientAge">
          <strong>العمر:</strong> {{ patientAge }} سنة
        </p>
        <p><strong>تاريخ الزيارة:</strong> <span class="numeric">{{ snapshot.visit_date }}</span></p>
        <p>
          <strong>التشخيصات:</strong> <DiagnosisList
            :diagnoses="snapshot.diagnoses || []"
            variant="code-only"
          />
        </p>
        <p><strong>الأدوية:</strong></p>
        <MedicationList
          :medications="scheduleMeds"
          variant="schedule"
        />
      </div>

      <ControlledSubstanceCard
        v-for="med in controlledMeds"
        :key="med.id"
        :medication="med.display_name || med.name"
        :dosage="med.dosage"
        :instructions="med.instructions || 'حسب تعليمات الطبيب'"
        class="mb-3"
      />

      <BaseCard>
        <CardHeader
          variant="neutral"
          icon="stamp"
          title="ختم العيادة"
        />
        <div class="card__body">
          <div class="form-group">
            <label for="prescription-stamp">رفع ختم (PNG/JPG)</label>
            <input
              id="prescription-stamp"
              type="file"
              accept=".png,.jpg,.jpeg"
              class="form-control"
              @change="handleStampUpload"
            >
          </div>
          <div
            v-if="stampPreview"
            class="mt-2"
          >
            <img
              :src="stampPreview"
              alt="معاينة الختم"
              style="max-height:80px;"
            >
            <BaseButton
              variant="danger"
              size="sm"
              class="mt-1"
              @click="clearStamp"
            >
              إزالة
            </BaseButton>
          </div>

          <div class="mt-3">
            <h5>توقيع الطبيب</h5>
            <SignaturePad
              :required="true"
              :error="signatureError"
              @save="onSignatureSave"
            />
          </div>

          <div class="mt-3 flex flex--gap-2">
            <BaseButton
              variant="primary"
              :loading="generating"
              @click="generatePdf"
            >
              <Icon icon="file-pdf" /> إنشاء وطباعة الروشتة
            </BaseButton>
            <BaseButton
              variant="secondary"
              :to="`/patients/${snapshot.patient_id}`"
            >
              إلغاء
            </BaseButton>
          </div>
          <AlertBar
            v-if="statusMsg"
            :severity="statusType"
            :title="statusMsg"
          />
        </div>
      </BaseCard>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed,onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import AlertBar from '@/components/ui/AlertBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import Icon from '@/components/ui/Icon.vue'
import SignaturePad from '@/components/ui/SignaturePad.vue'
import { useApi } from '@/composables/useApi'
import ControlledSubstanceCard from '@/features/clinical/components/ControlledSubstanceCard.vue'
import DiagnosisList from '@/features/clinical/components/DiagnosisList.vue'
import MedicationList from '@/features/clinical/components/MedicationList.vue'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { unwrapResponse } from '@/services/apiClient'

const route = useRoute()
const visitId = route.params.visitId
const snapshot = ref(null)
const previewToken = ref('')
const stampFile = ref(null)
const stampPreview = ref(null)
const signatureData = ref(null)
const signatureError = ref('')
const statusMsg = ref('')
const statusType = ref('info')

const breadcrumbs = computed(() => [
  { label: 'المرضى', to: { name: 'PatientsList' } },
  { label: 'روشتة' }
])

const patientName = computed(() => snapshot.value?.patient_name || '')
const patientAge = computed(() => snapshot.value?.patient_age === 'غير محدد' ? null : snapshot.value?.patient_age)
const controlledMeds = computed(() => {
  if (!snapshot.value?.medications) return []
  return snapshot.value.medications.filter(m => m.controlled === true)
})
const scheduleMeds = computed(() => snapshot.value?.medications?.map(m => ({
  name: m.name || '',
  dosage: m.dosage || '',
  brand: m.brand || '',
  schedule: m.instructions || '',
  controlled: m.controlled === true,
})) || [])

onMounted(async () => {
  try {
    const response = await prescriptionService.preview(visitId)
    const data = unwrapResponse(response)
    snapshot.value = data
    previewToken.value = data.preview_token
  } catch {
    statusMsg.value = 'تعذر تحميل معاينة الوصفة'
    statusType.value = 'danger'
  }
})

function handleStampUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    statusMsg.value = 'صيغة الختم أو حجمه غير صالح'
    statusType.value = 'danger'
    event.target.value = ''
    return
  }
  stampFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { stampPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

function clearStamp() { stampFile.value = null; stampPreview.value = null }

function onSignatureSave(dataUrl) { signatureData.value = dataUrl; signatureError.value = '' }

const { loading: generating, execute: doGenerate } = useApi(async () => {
  if (!signatureData.value) { signatureError.value = 'يجب توقيع الروشتة أولاً'; throw new Error('no signature') }
  statusMsg.value = 'جاري إنشاء الروشتة...'
  statusType.value = 'info'

  const payload = {
    visit_id: visitId,
    preview_token: previewToken.value,
    signature: signatureData.value,
  }
  if (stampFile.value) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(stampFile.value)
    })
    payload.stamp = dataUrl
  }

  const response = await prescriptionService.generate(payload)
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const a = document.createElement('a')
  a.href = url; a.download = `prescription_${visitId}.pdf`
  document.body.appendChild(a); a.click(); a.remove()
  window.URL.revokeObjectURL(url)
  statusMsg.value = 'تم إنشاء الروشتة بنجاح'; statusType.value = 'success'
})

async function generatePdf() {
  try { await doGenerate() } catch { /* error already handled by useApi */ }
}
</script>
