<template>
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
              <label
                class="radio"
                for="diag-merge"
              >
                <input
                  id="diag-merge"
                  v-model="diagMode"
                  :disabled="diagLoading"
                  type="radio"
                  value="merge"
                  class="radio__input"
                >
                دمج
              </label>
              <label
                class="radio"
                for="diag-replace"
              >
                <input
                  id="diag-replace"
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
          {{
            (diagPreview.counts?.failed || 0) +
              (diagPreview.counts?.duplicate || 0)
          }}
          متخطى.
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

let diagGeneration = 0
onBeforeUnmount(() => {
  diagGeneration += 1
})
const diagMode = ref('merge'),
  diagFile = ref(null),
  diagPreview = ref(null),
  diagPreviewToken = ref('')
const confirmReplaceDiag = ref(false)
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
  await importService.importDiagnoses(
    file,
    diagMode.value,
    diagPreviewToken.value,
  )
  resetDiagnosisPreview()
})

const importDiagnoses = () => {
  if (!diagLoading.value) doDiagImport().catch(() => {})
}
const resetDiagnosisPreview = () => {
  diagGeneration += 1
  confirmReplaceDiag.value = false
  diagPreview.value = null
  diagPreviewToken.value = ''
}
watch(diagMode, resetDiagnosisPreview, { flush: 'sync' })
</script>
