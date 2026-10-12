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
        <p v-if="patientAge !== null && patientAge !== undefined">
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

      <PrescriptionPaperOptions v-model="paperOptions" :snapshot="snapshot" :disabled="generating" @validity="paperReady = $event" />

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
              alt="معاينة الختم" class="prescription-signature">
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
              @change="signatureData = null"
            />
          </div>

          <div class="mt-3 flex gap-2">
            <BaseButton
              variant="primary"
              :loading="generating"
              :disabled="!paperReady || !previewToken"
              @click="generatePdf"
            >
              <Icon icon="file-pdf" /> إنشاء وطباعة الروشتة
            </BaseButton>
            <BaseButton v-if="!previewToken" variant="secondary" @click="loadPreview">معاينة جديدة لطباعة نسخة أخرى</BaseButton>
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
import { onBeforeUnmount, computed,onMounted, ref } from 'vue'
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
import PrescriptionPaperOptions from '@/features/prescription/components/PrescriptionPaperOptions.vue'
import { defaultPaperOptions, normalizePaperOptions } from '@/features/prescription/services/prescriptionPaper'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { unwrapResponse } from '@/services/apiClient'

const route = useRoute()
const visitId = route.params.visitId
const snapshot = ref(null)
const previewToken = ref('')
const paperOptions = ref(defaultPaperOptions())
const paperReady = ref(true)
let disposed = false
let stampGeneration = 0
onBeforeUnmount(() => { stampGeneration += 1; disposed = true })
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

async function loadPreview() {
  statusMsg.value = ''
  try {
    const response = await prescriptionService.preview(visitId)
    const data = unwrapResponse(response)
    if (disposed) return
    snapshot.value = data
    previewToken.value = data.preview_token
  } catch {
    if (disposed) return
    statusMsg.value = 'تعذر تحميل معاينة الوصفة'
    statusType.value = 'danger'
  }
}
onMounted(loadPreview)

function handleStampUpload(event) {
  const request = ++stampGeneration
  stampPreview.value = null
  stampFile.value = null
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
  reader.onload = (e) => { if (request === stampGeneration) stampPreview.value = e.target.result }
  reader.onerror = reader.onabort = () => { if (request === stampGeneration) { statusMsg.value = 'تعذر قراءة الختم'; statusType.value = 'danger' } }
  reader.readAsDataURL(file)
}

function clearStamp() { stampGeneration += 1; stampFile.value = null; stampPreview.value = null }

function onSignatureSave(dataUrl) { signatureData.value = dataUrl; signatureError.value = '' }

const { loading: generating, execute: doGenerate } = useApi(async () => {
  if (!signatureData.value) { signatureError.value = 'يجب توقيع الروشتة أولاً'; throw new Error('no signature') }
  const printOptions = normalizePaperOptions(paperOptions.value)
  if (!printOptions || !previewToken.value) throw new Error('تحقق من الورق وافتح معاينة صالحة قبل الطباعة')
  statusMsg.value = 'جاري إنشاء الروشتة...'
  statusType.value = 'info'

  const payload = {
    visit_id: visitId,
    preview_token: previewToken.value,
    signature: signatureData.value,
    print_options: printOptions,
  }
  const currentStamp = stampFile.value
  if (currentStamp) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = reader.onabort = () => reject(new Error('تعذر قراءة الختم'))
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(currentStamp)
    })
    payload.stamp = dataUrl
  }

  const response = await prescriptionService.generate(payload)
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const a = document.createElement('a')
  a.href = url; a.download = `prescription_${visitId}.pdf`
  document.body.appendChild(a); a.click(); a.remove()
  window.URL.revokeObjectURL(url)
  previewToken.value = ''
  statusMsg.value = 'تم إنشاء الروشتة بنجاح'; statusType.value = 'success'
})

async function generatePdf() {
  try { await doGenerate() } catch { /* error already handled by useApi */ }
}
</script>
