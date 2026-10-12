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

      <PrescriptionPaperOptions v-model="paperOptions" :snapshot="snapshot" :disabled="generating || calibrating" @validity="paperReady = $event" />
      <BaseButton :disabled="!paperReady || generating" :loading="calibrating" @click="createCalibration">إنشاء ورقة معايرة</BaseButton>
      <PrescriptionPdfPreview v-if="calibrationUrl" :url="calibrationUrl" filename="prescription-calibration.pdf" calibration />

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
              :disabled="!paperReady || !previewToken || calibrating"
              @click="generatePdf"
            >
              <Icon icon="file-pdf" /> إنشاء ومعاينة الروشتة
            </BaseButton>
            <BaseButton v-if="!previewToken" variant="secondary" :loading="previewLoading" @click="loadPreview">معاينة جديدة لطباعة نسخة أخرى</BaseButton>
            <BaseButton
              variant="secondary"
              :to="`/patients/${snapshot.patient_id}`"
            >
              إلغاء
            </BaseButton>
          </div>
          <p>تُحفظ نسخة معتمدة عند الإنشاء. المعاينة والطباعة والتنزيل تستخدم هذه النسخة نفسها؛ تغيير الورق أو التوقيع يحتاج نسخة جديدة.</p>
          <PrescriptionPdfPreview v-if="prescriptionUrl" :url="prescriptionUrl" :filename="`prescription_${visitId}.pdf`" />
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
import { onBeforeUnmount, computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AlertBar from '@/components/ui/AlertBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import Icon from '@/components/ui/Icon.vue'
import SignaturePad from '@/components/ui/SignaturePad.vue'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/features/auth/stores/auth'
import ControlledSubstanceCard from '@/features/clinical/components/ControlledSubstanceCard.vue'
import DiagnosisList from '@/features/clinical/components/DiagnosisList.vue'
import MedicationList from '@/features/clinical/components/MedicationList.vue'
import PrescriptionPaperOptions from '@/features/prescription/components/PrescriptionPaperOptions.vue'
import PrescriptionPdfPreview from '@/features/prescription/components/PrescriptionPdfPreview.vue'
import { loadPaperOptions, normalizePaperOptions, rememberPaperOptions } from '@/features/prescription/services/prescriptionPaper'
import prescriptionService from '@/features/prescription/services/prescriptionService'
import { unwrapResponse } from '@/services/apiClient'
import { onSessionChange, sessionGeneration } from '@/services/sessionState'

const route = useRoute()
const visitId = route.params.visitId
const auth = useAuthStore()
const snapshot = ref(null)
const previewToken = ref('')
const previewLoading = ref(false)
const paperOptions = ref(loadPaperOptions(auth.user?.id))
watch(() => auth.user?.id, id => { paperOptions.value = loadPaperOptions(id) }, { flush: 'sync' })
watch(paperOptions, paper => rememberPaperOptions(auth.user?.id, paper), { deep: true })
const paperReady = ref(true)
const prescriptionUrl = ref('')
const calibrationUrl = ref('')
const calibrating = ref(false)
function releaseUrl(target) { if (target.value) window.URL.revokeObjectURL(target.value); target.value = '' }
function replacePdf(target, data) {
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  releaseUrl(target)
  target.value = url
}
let disposed = false
let stampGeneration = 0
const removeSessionListener = onSessionChange(() => {
  stampGeneration += 1
  releaseUrl(prescriptionUrl); releaseUrl(calibrationUrl)
  snapshot.value = null; previewToken.value = ''; signatureData.value = null
  previewLoading.value = false
  stampFile.value = null; stampPreview.value = null; statusMsg.value = ''
})
onBeforeUnmount(() => {
  stampGeneration += 1; disposed = true; removeSessionListener()
  releaseUrl(prescriptionUrl); releaseUrl(calibrationUrl)
})
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
  if (previewLoading.value) return
  const epoch = sessionGeneration()
  previewLoading.value = true
  statusMsg.value = ''
  try {
    const response = await prescriptionService.preview(visitId)
    const data = unwrapResponse(response)
    if (disposed || epoch !== sessionGeneration()) return
    releaseUrl(prescriptionUrl)
    snapshot.value = data
    previewToken.value = data.preview_token
  } catch {
    if (disposed || epoch !== sessionGeneration()) return
    statusMsg.value = 'تعذر تحميل معاينة الوصفة'
    statusType.value = 'danger'
  } finally { if (!disposed && epoch === sessionGeneration()) previewLoading.value = false }
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
  const epoch = sessionGeneration()
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

  if (disposed || epoch !== sessionGeneration()) return
  const response = await prescriptionService.generate(payload)
  if (disposed || epoch !== sessionGeneration()) return
  replacePdf(prescriptionUrl, response.data)
  previewToken.value = ''
  statusMsg.value = 'تم إنشاء الروشتة بنجاح'; statusType.value = 'success'
})

async function createCalibration() {
  if (calibrating.value || generating.value) return
  const options = normalizePaperOptions(paperOptions.value)
  if (!options) return
  const epoch = sessionGeneration()
  calibrating.value = true
  try {
    const response = await prescriptionService.calibration(options)
    if (!disposed && epoch === sessionGeneration()) replacePdf(calibrationUrl, response.data)
  } catch {
    if (!disposed && epoch === sessionGeneration()) { statusMsg.value = 'تعذر إنشاء ورقة المعايرة؛ حاول مجدداً'; statusType.value = 'danger' }
  } finally { calibrating.value = false }
}

async function generatePdf() {
  try { await doGenerate() } catch { /* error already handled by useApi */ }
}
</script>
