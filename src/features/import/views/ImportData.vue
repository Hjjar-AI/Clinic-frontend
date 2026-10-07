<!-- frontend/src/features/import/views/ImportData.vue -->
<template>
  <div class="import-data-view">
    <Breadcrumb :items="[{ label: 'استيراد' }, { label: 'استيراد المرضى' }]" />
    <PageHeader
      title="استيراد جماعي للمرضى"
      subtitle="ارفع ملف Excel أو CSV لاستيراد سجلات المرضى دفعة واحدة."
    />

    <StepIndicator
      :steps="['رفع الملف', 'مراجعة البيانات', 'تأكيد']"
      :current="currentStep"
    />

    <BaseCard v-if="currentStep === 0">
      <div class="card__body">
        <AlertBar
          severity="info"
          title="يمكنك رفع ملف Excel (.xlsx) أو CSV."
        >
          <BaseButton
            variant="ghost"
            size="sm"
            icon="download"
            @click="downloadTemplate"
          >
            تنزيل قالب الاستيراد v1
          </BaseButton>
        </AlertBar>
        <form @submit.prevent="goToReview">
          <FormField
            label="اختر ملف Excel أو CSV"
            required
          >
            <FileUpload
              :max-size-mb="200"
              accept=".xlsx,.csv"
              instructions="اسحب وأفلت الملف هنا"
              :auto-upload="false"
              @select="previewFile"
            />
          </FormField>
          <FormField label="تعيين جميع المرضى إلى الطبيب (اختياري)">
            <select
              v-model="doctorId"
              class="form-control form-control--select"
              aria-label="الطبيب المسؤول"
              @change="selectedFile && previewFile(selectedFile)"
            >
              <option value="">
                -- اختر الطبيب --
              </option>
              <option
                v-for="doc in userStore.doctors"
                :key="doc.id"
                :value="doc.id"
              >
                {{ doc.full_name || doc.username }}
              </option>
            </select>
          </FormField>
          <div class="flex flex--gap-2 mt-3">
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="!previewResult || previewing"
            >
              <Icon icon="arrow-right" /> التالي
            </BaseButton>
            <BaseButton
              variant="secondary"
              :to="{ name: 'PatientsList' }"
            >
              إلغاء
            </BaseButton>
          </div>
        </form>
      </div>
    </BaseCard>

    <BaseCard v-if="currentStep === 1">
      <CardHeader
        variant="neutral"
        title="مراجعة البيانات"
      />
      <div class="card__body">
        <p>تم رفع الملف بنجاح. يرجى مراجعة الأخطاء والتحذيرات أدناه.</p>
        <div v-if="previewResult">
          <AlertBar
            v-if="previewResult.added"
            severity="success"
            :title="`سيتم استيراد ${previewResult.added} مريض`"
          />
          <AlertBar
            v-if="previewResult.skipped"
            severity="warning"
            :title="`سيتم تخطي ${previewResult.skipped} مريض`"
          />
          <ErrorList
            v-if="previewResult.errors?.length"
            severity="danger"
            title="أخطاء"
            :errors="previewResult.errors"
          />
          <ErrorList
            v-if="previewResult.warnings?.length"
            severity="warning"
            title="تنبيهات"
            :errors="previewResult.warnings"
          />
        </div>
        <div class="flex flex--gap-2 mt-3">
          <BaseButton
            variant="primary"
            :loading="importing"
            :disabled="importing || !previewResult.added"
            @click="confirmImport"
          >
            تأكيد الاستيراد
          </BaseButton>
          <BaseButton
            variant="secondary"
            @click="currentStep = 0"
          >
            عودة
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseCard v-if="currentStep === 2">
      <CardHeader
        variant="success"
        title="تم الاستيراد"
      />
      <div class="card__body">
        <AlertBar
          :severity="previewResult?.errors?.length ? 'warning' : 'success'"
          :title="`تم استيراد ${previewResult?.added || 0} مريض، وتخطي ${previewResult?.skipped || 0}`"
        />
        <ErrorList
          v-if="previewResult?.errors?.length"
          severity="danger"
          title="سجلات لم تُستورد"
          :errors="previewResult.errors"
        />
        <BaseButton
          variant="primary"
          :to="{ name: 'PatientsList' }"
        >
          عرض المرضى
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import FileUpload from '@/components/common/FileUpload.vue'
import AlertBar from '@/components/ui/AlertBar.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import ErrorList from '@/components/ui/ErrorList.vue'
import FormField from '@/components/ui/FormField.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StepIndicator from '@/components/ui/StepIndicator.vue'
import { useNotify } from '@/composables/useNotify'
import importService from '@/features/import/services/importService'
import { useUserStore } from '@/features/settings/stores/users'

const userStore = useUserStore()
const doctorId = ref('')
const previewResult = ref(null)
const currentStep = ref(0)
const selectedFile = ref(null)
const previewing = ref(false)
const importing = ref(false)
const { notify } = useNotify()

if (!userStore.doctors.length) {
  userStore.fetchDoctors()
}

const previewFile = async (file) => {
  selectedFile.value = file
  previewResult.value = null
  if (!file) return
  previewing.value = true
  try {
    previewResult.value = await importService.previewPatients(file, doctorId.value)
  } catch {
    notify('تعذر فحص الملف. تحقق من صيغته وحاول مجدداً.', 'danger')
  } finally {
    previewing.value = false
  }
}

function goToReview() {
  if (previewResult.value) {
    currentStep.value = 1
  }
}

const confirmImport = async () => {
  if (!selectedFile.value) return
  importing.value = true
  try {
    previewResult.value = await importService.importPatients(
      selectedFile.value,
      doctorId.value,
      previewResult.value?.preview_token,
    )
    currentStep.value = 2
  } catch {
    notify('فشل الاستيراد. لم يتم تأكيد اكتمال العملية.', 'danger')
  } finally {
    importing.value = false
  }
}

async function downloadTemplate() {
  const blob = await importService.downloadPatientTemplate()
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'patients_import_template_v1.csv'
  anchor.click()
  window.URL.revokeObjectURL(url)
}
</script>
