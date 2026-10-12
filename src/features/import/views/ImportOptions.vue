<template>
  <div class="import-options-view">
    <PageHeader
      title="استيراد البيانات"
      subtitle="استيراد محتوى التشخيصات وأسماء الأدوية وجرعاتها؛ حالة التفعيل وتصنيف الأدوية المراقبة لا يُستعادان من الملف. الاستعادة الكاملة متاحة عبر النسخ الاحتياطي."
    />

    <div class="grid-2 mb-3">
      <BaseCard>
        <CardHeader
          variant="primary"
          icon="diagnoses"
          title="استيراد التشخيصات"
        />
        <div class="card__body">
          <p class="text-sm text-muted mb-2">
            ملف Excel بـ 3 أعمدة (كود, إنجليزي, عربي)
          </p>
          <form
            enctype="multipart/form-data"
            @submit.prevent="importDiagnoses"
          >
            <FormField
              label="اختر ملف التشخيصات"
              field-id="diagFile"
              required
            >
              <input
                id="diagFile"
                ref="diagFile"
                :disabled="diagLoading"
                type="file"
                accept=".csv,.xlsx,.xls"
                class="form-control"
                required
                @change="resetDiagnosisPreview"
              >
            </FormField>

            <div class="flex gap-2 mb-2">
              <FormField
                label="طريقة الدمج"
                field-id="diagMode"
                class="flex--1"
              >
                <div class="flex gap-3">
                  <label class="radio">
                    <input
                      v-model="diagMode"
                      :disabled="diagLoading"
                      type="radio"
                      value="merge"
                      class="radio__input"
                    >
                    دمج
                  </label>
                  <label class="radio">
                    <input
                      v-model="diagMode"
                      :disabled="diagLoading"
                      type="radio"
                      value="replace"
                      class="radio__input"
                    >
                    استبدال
                  </label>
                </div>
              </FormField>
            </div>

            <ConfirmCheckbox
              v-if="diagMode === 'replace'"
              v-model="confirmReplaceDiag"
              label="أوافق على استبدال جميع التشخيصات الحالية."
              variant="danger"
            />

            <div
              v-if="diagPreview"
              class="alert alert--info mb-2"
            >
              المعاينة: {{ diagPreview.counts?.create || 0 }} جديد،
              {{ diagPreview.counts?.update || 0 }} تحديث،
              {{ diagPreview.counts?.reactivate || 0 }} إعادة تفعيل،
              {{ (diagPreview.counts?.failed || 0) + (diagPreview.counts?.duplicate || 0) }} متخطى.
            </div>

            <BaseButton
              type="submit"
              variant="primary"
              :loading="diagLoading"
              :disabled="diagMode === 'replace' && !confirmReplaceDiag"
            >
              <Icon :icon="diagPreview ? 'check' : 'search'" />
              {{ diagPreview ? 'تنفيذ الاستيراد' : 'معاينة' }}
            </BaseButton>
          </form>
        </div>
      </BaseCard>

      <BaseCard>
        <CardHeader
          variant="success"
          icon="pills"
          title="استيراد الأدوية"
        />
        <div class="card__body">
          <p class="text-sm text-muted mb-2">
            ملف Excel بخمسة أعمدة
          </p>
          <form
            enctype="multipart/form-data"
            @submit.prevent="uploadMedications"
          >
            <FormField
              label="اختر ملف الأدوية"
              field-id="medFile"
              required
            >
              <input
                id="medFile"
                ref="medFile"
                :disabled="medMappingLoading || medUploadLoading"
                @change="resetMedicationPreview"
                type="file"
                accept=".csv,.xlsx,.xls"
                class="form-control"
                required
              >
            </FormField>

            <BaseButton
              type="submit"
              variant="success"
              :loading="medUploadLoading"
            >
              <Icon icon="upload" /> رفع وتحديد الأعمدة
            </BaseButton>
          </form>
        </div>
      </BaseCard>
    </div>

    <BaseCard
      v-if="medPreview"
      class="mt-3"
    >
      <CardHeader title="تحديد أعمدة الأدوية" />
      <div class="card__body">
        <p class="text-sm text-muted mb-2">
          معاينة أول 5 صفوف
        </p>
        <div class="table-wrapper">
          <table class="table table--striped mb-3">
            <thead>
              <tr>
                <th
                  v-for="(col,i) in columns"
                  :key="i"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row,i) in medPreview"
                :key="i"
              >
                <td
                  v-for="(cell,j) in row"
                  :key="j"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <form @submit.prevent="mapMedications">
          <div class="grid-2">
            <!-- Each column mapping is now wrapped with FormField -->
            <FormField
              label="الاسم العام (إنجليزي) *"
              field-id="mapGenericEnglish"
              required
            >
              <select
                id="mapGenericEnglish"
                v-model="colMap.generic_english"
                  :disabled="medMappingLoading || medUploadLoading"
                class="form-control"
                required
              >
                <option value="">
                  -- اختر --
                </option>
                <option
                  v-for="(col,i) in columns"
                  :key="i"
                  :value="i"
                >
                  {{ col }}
                </option>
              </select>
            </FormField>

            <FormField
              label="الاسم العام (عربي)"
              field-id="mapGenericArabic"
            >
              <select
                id="mapGenericArabic"
                v-model="colMap.generic_arabic"
                  :disabled="medMappingLoading || medUploadLoading"
                class="form-control"
              >
                <option value="">
                  -- بدون --
                </option>
                <option
                  v-for="(col,i) in columns"
                  :key="i"
                  :value="i"
                >
                  {{ col }}
                </option>
              </select>
            </FormField>

            <FormField
              label="الجرعة"
              field-id="mapDosage"
            >
              <select
                id="mapDosage"
                v-model="colMap.dosage"
                  :disabled="medMappingLoading || medUploadLoading"
                class="form-control"
              >
                <option value="">
                  -- بدون --
                </option>
                <option
                  v-for="(col,i) in columns"
                  :key="i"
                  :value="i"
                >
                  {{ col }}
                </option>
              </select>
            </FormField>

            <FormField
              label="العلامة (إنجليزي)"
              field-id="mapBrandEnglish"
            >
              <select
                id="mapBrandEnglish"
                v-model="colMap.brand_english"
                  :disabled="medMappingLoading || medUploadLoading"
                class="form-control"
              >
                <option value="">
                  -- بدون --
                </option>
                <option
                  v-for="(col,i) in columns"
                  :key="i"
                  :value="i"
                >
                  {{ col }}
                </option>
              </select>
            </FormField>

            <FormField
              label="العلامة (عربي)"
              field-id="mapBrandArabic"
            >
              <select
                id="mapBrandArabic"
                v-model="colMap.brand_arabic"
                  :disabled="medMappingLoading || medUploadLoading"
                class="form-control"
              >
                <option value="">
                  -- بدون --
                </option>
                <option
                  v-for="(col,i) in columns"
                  :key="i"
                  :value="i"
                >
                  {{ col }}
                </option>
              </select>
            </FormField>
          </div>

          <FormField
            label="طريقة الدمج"
            field-id="medMergeMode"
            class="mt-3"
          >
            <div class="flex gap-3">
              <label class="radio">
                <input
                  v-model="medMergeMode"
                  :disabled="medMappingLoading || medUploadLoading"
                  type="radio"
                  value="merge"
                  class="radio__input"
                >
                دمج
              </label>
              <label class="radio">
                <input
                  v-model="medMergeMode"
                  :disabled="medMappingLoading || medUploadLoading"
                  type="radio"
                  value="overwrite"
                  class="radio__input"
                >
                استبدال
              </label>
            </div>
          </FormField>

          <ConfirmCheckbox
            v-if="medMergeMode === 'overwrite'"
            v-model="confirmOverwriteMeds"
            label="أوافق على الاستبدال الكامل لقائمة الأدوية."
            variant="danger"
          />

          <BaseButton
            type="submit"
            variant="primary"
            class="mt-3"
            :loading="medMappingLoading"
            :disabled="medMergeMode === 'overwrite' && !confirmOverwriteMeds"
          >
            <Icon icon="upload" /> {{ mappedPreview ? 'تأكيد استيراد الأدوية' : 'معاينة الاستيراد' }}
          </BaseButton>
          <p v-if="mappedPreview" role="status">
            {{ mappedPreview.counts.create }} إضافة، {{ mappedPreview.counts.update }} تحديث،
            {{ mappedPreview.counts.failed }} صف غير صالح، {{ mappedPreview.will_retire_existing }} سجل سيُستبدل.
          </p>
        </form>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import ConfirmCheckbox from '@/components/ui/ConfirmCheckbox.vue'
import FormField from '@/components/ui/FormField.vue'
import Icon from '@/components/ui/Icon.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useApi } from '@/composables/useApi'
import importService from '@/features/import/services/importService'

let diagGeneration = 0, medGeneration = 0
onBeforeUnmount(() => { diagGeneration += 1; medGeneration += 1 })
const diagMode = ref('merge')
const diagFile = ref(null)
const diagPreview = ref(null)
const diagPreviewToken = ref('')
const medFile = ref(null)
const medPreview = ref(null)
const medPreviewToken = ref('')
const mappedPreview = ref(null)
const columns = ref([])
const colMap = ref({ generic_english: null, generic_arabic: null, dosage: null, brand_english: null, brand_arabic: null })
const medMergeMode = ref('merge')
const confirmReplaceDiag = ref(false)
const confirmOverwriteMeds = ref(false)

const { loading: diagLoading, execute: doDiagImport } = useApi(async () => {
  const file = diagFile.value?.files?.[0]
  if (!file) return
  const request = diagGeneration
  const mode = diagMode.value
  if (!diagPreviewToken.value) {
    const result = await importService.previewDiagnoses(file, mode)
    if (request !== diagGeneration) return
    diagPreview.value = result
    diagPreviewToken.value = diagPreview.value?.preview_token || ''
    return
  }
  await importService.importDiagnoses(file, diagMode.value, diagPreviewToken.value)
  resetDiagnosisPreview()
})

const importDiagnoses = () => { if (!diagLoading.value) doDiagImport().catch(() => {}) }
const resetDiagnosisPreview = () => {
  diagGeneration += 1
  confirmReplaceDiag.value = false
  diagPreview.value = null
  diagPreviewToken.value = ''
}
watch(diagMode, resetDiagnosisPreview, { flush: 'sync' })

const { loading: medUploadLoading, execute: doMedUpload } = useApi(async () => {
  const file = medFile.value?.files?.[0]
  if (!file) return
  const request = medGeneration
  const res = await importService.uploadMedications(file)
  if (request !== medGeneration) return
  const payload = res?.data?.data || res?.data || res
  mappedPreview.value = null
  medPreview.value = payload.preview_rows || []
  medPreviewToken.value = payload.preview_token || ''
  columns.value = payload.columns || []
  colMap.value = { generic_english: null, generic_arabic: null, dosage: null, brand_english: null, brand_arabic: null }
})

const uploadMedications = () => { if (!medUploadLoading.value && !medMappingLoading.value) doMedUpload().catch(() => {}) }

const { loading: medMappingLoading, execute: doMedMapping } = useApi(async () => {
  const file = medFile.value?.files?.[0]
  if (!file) return
  const request = medGeneration
  const token = medPreviewToken.value
  const payload = { column_map: { ...colMap.value }, merge_mode: medMergeMode.value }
  if (!mappedPreview.value) {
    const result = await importService.mapMedications(file, payload.column_map, payload.merge_mode, token, true)
    if (request !== medGeneration) return
    mappedPreview.value = result
    medPreviewToken.value = mappedPreview.value.preview_token
    return
  }
  await importService.mapMedications(file, payload.column_map, payload.merge_mode, medPreviewToken.value)
  mappedPreview.value = null
  medPreview.value = null
  medPreviewToken.value = ''
})

watch([colMap, medMergeMode], () => { medGeneration += 1; mappedPreview.value = null; confirmOverwriteMeds.value = false }, { deep: true, flush: 'sync' })
function resetMedicationPreview() { medGeneration += 1; mappedPreview.value = null; medPreview.value = null; medPreviewToken.value = ''; columns.value = []; confirmOverwriteMeds.value = false }
const mapMedications = () => { if (!medMappingLoading.value && !medUploadLoading.value) doMedMapping().catch(() => {}) }
</script>
