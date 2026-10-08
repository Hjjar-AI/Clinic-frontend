<template>
  <div class="import-options-view">
    <PageHeader
      title="استيراد البيانات"
      subtitle="استيراد التشخيصات والأدوية من ملفات Excel."
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
                      type="radio"
                      value="merge"
                      class="radio__input"
                    >
                    دمج
                  </label>
                  <label class="radio">
                    <input
                      v-model="diagMode"
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
                  type="radio"
                  value="merge"
                  class="radio__input"
                >
                دمج
              </label>
              <label class="radio">
                <input
                  v-model="medMergeMode"
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
import { ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import ConfirmCheckbox from '@/components/ui/ConfirmCheckbox.vue'
import FormField from '@/components/ui/FormField.vue'
import Icon from '@/components/ui/Icon.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useApi } from '@/composables/useApi'
import importService from '@/features/import/services/importService'

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
  if (!diagPreviewToken.value) {
    diagPreview.value = await importService.previewDiagnoses(file, diagMode.value)
    diagPreviewToken.value = diagPreview.value?.preview_token || ''
    return
  }
  await importService.importDiagnoses(file, diagMode.value, diagPreviewToken.value)
  resetDiagnosisPreview()
})

const importDiagnoses = () => doDiagImport()
const resetDiagnosisPreview = () => {
  diagPreview.value = null
  diagPreviewToken.value = ''
}
watch(diagMode, resetDiagnosisPreview)

const { loading: medUploadLoading, execute: doMedUpload } = useApi(async () => {
  const file = medFile.value?.files?.[0]
  if (!file) return
  const res = await importService.uploadMedications(file)
  const payload = res?.data?.data || res?.data || res
  mappedPreview.value = null
  medPreview.value = payload.preview_rows || []
  medPreviewToken.value = payload.preview_token || ''
  columns.value = payload.columns || []
  colMap.value = { generic_english: null, generic_arabic: null, dosage: null, brand_english: null, brand_arabic: null }
})

const uploadMedications = () => doMedUpload()

const { loading: medMappingLoading, execute: doMedMapping } = useApi(async () => {
  const file = medFile.value?.files?.[0]
  if (!file) return
  const payload = { column_map: { ...colMap.value }, merge_mode: medMergeMode.value }
  if (!mappedPreview.value) {
    mappedPreview.value = await importService.mapMedications(file, payload.column_map, payload.merge_mode, medPreviewToken.value, true)
    medPreviewToken.value = mappedPreview.value.preview_token
    return
  }
  await importService.mapMedications(file, payload.column_map, payload.merge_mode, medPreviewToken.value)
  mappedPreview.value = null
  medPreview.value = null
  medPreviewToken.value = ''
})

watch([colMap, medMergeMode], () => { mappedPreview.value = null }, { deep: true })
const mapMedications = () => doMedMapping()
</script>
