<template>
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
            type="file"
            accept=".csv,.xlsx,.xls"
            class="form-control"
            required
            @change="resetMedicationPreview"
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
  <BaseCard
    v-if="medPreview"
    class="import-medication-mapping mt-3"
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
                v-for="(col, i) in columns"
                :key="i"
              >
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in medPreview"
              :key="i"
            >
              <td
                v-for="(cell, j) in row"
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
          <FormField
            v-for="field in mappingFields"
            :key="field.key"
            :label="field.label"
            :field-id="field.id"
            :required="field.required"
          >
            <select
              :id="field.id"
              v-model="colMap[field.key]"
              :disabled="medMappingLoading || medUploadLoading"
              class="form-control"
              :required="field.required"
            >
              <option value="">
                {{ field.required ? '-- اختر --' : '-- بدون --' }}
              </option>
              <option
                v-for="(column, index) in columns"
                :key="index"
                :value="index"
              >
                {{ column }}
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
            <label
              class="radio"
              for="med-merge"
            >
              <input
                id="med-merge"
                v-model="medMergeMode"
                :disabled="medMappingLoading || medUploadLoading"
                type="radio"
                value="merge"
                class="radio__input"
              >
              دمج
            </label>
            <label
              class="radio"
              for="med-overwrite"
            >
              <input
                id="med-overwrite"
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
          <Icon icon="upload" />
          {{ mappedPreview ? 'تأكيد استيراد الأدوية' : 'معاينة الاستيراد' }}
        </BaseButton>
        <p
          v-if="mappedPreview"
          role="status"
        >
          {{ mappedPreview.counts.create }} إضافة،
          {{ mappedPreview.counts.update }} تحديث،
          {{ mappedPreview.counts.failed }} صف غير صالح،
          {{ mappedPreview.will_retire_existing }} سجل سيُستبدل.
        </p>
      </form>
    </div>
  </BaseCard>
</template>
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import ConfirmCheckbox from '@/components/ui/ConfirmCheckbox.vue'
import FormField from '@/components/ui/FormField.vue'
import Icon from '@/components/ui/Icon.vue'
import { useApi } from '@/composables/useApi'
import importService from '@/features/import/services/importService'

let medGeneration = 0
onBeforeUnmount(() => {
  medGeneration += 1
})
const medFile = ref(null),
  medPreview = ref(null),
  medPreviewToken = ref(''),
  mappedPreview = ref(null)
const columns = ref([])
const colMap = ref({
  generic_english: null,
  generic_arabic: null,
  dosage: null,
  brand_english: null,
  brand_arabic: null,
})
const medMergeMode = ref('merge'),
  confirmOverwriteMeds = ref(false)
const mappingFields = [
  {
    key: 'generic_english',
    id: 'mapGenericEnglish',
    label: 'الاسم العام (إنجليزي) *',
    required: true,
  },
  {
    key: 'generic_arabic',
    id: 'mapGenericArabic',
    label: 'الاسم العام (عربي)',
  },
  { key: 'dosage', id: 'mapDosage', label: 'الجرعة' },
  { key: 'brand_english', id: 'mapBrandEnglish', label: 'العلامة (إنجليزي)' },
  { key: 'brand_arabic', id: 'mapBrandArabic', label: 'العلامة (عربي)' },
]
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
  colMap.value = {
    generic_english: null,
    generic_arabic: null,
    dosage: null,
    brand_english: null,
    brand_arabic: null,
  }
})

const uploadMedications = () => {
  if (!medUploadLoading.value && !medMappingLoading.value)
    doMedUpload().catch(() => {})
}

const { loading: medMappingLoading, execute: doMedMapping } = useApi(
  async () => {
    const file = medFile.value?.files?.[0]
    if (!file) return
    const request = medGeneration
    const token = medPreviewToken.value
    const payload = {
      column_map: { ...colMap.value },
      merge_mode: medMergeMode.value,
    }
    if (!mappedPreview.value) {
      const result = await importService.mapMedications(
        file,
        payload.column_map,
        payload.merge_mode,
        token,
        true,
      )
      if (request !== medGeneration) return
      mappedPreview.value = result
      medPreviewToken.value = mappedPreview.value.preview_token
      return
    }
    await importService.mapMedications(
      file,
      payload.column_map,
      payload.merge_mode,
      medPreviewToken.value,
    )
    mappedPreview.value = null
    medPreview.value = null
    medPreviewToken.value = ''
  },
)

watch(
  [colMap, medMergeMode],
  () => {
    medGeneration += 1
    mappedPreview.value = null
    confirmOverwriteMeds.value = false
  },
  { deep: true, flush: 'sync' },
)
function resetMedicationPreview() {
  medGeneration += 1
  mappedPreview.value = null
  medPreview.value = null
  medPreviewToken.value = ''
  columns.value = []
  confirmOverwriteMeds.value = false
}
const mapMedications = () => {
  if (!medMappingLoading.value && !medUploadLoading.value)
    doMedMapping().catch(() => {})
}
</script>
