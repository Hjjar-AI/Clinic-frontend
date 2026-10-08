<template>
  <div class="backup-view">
    <PageHeader
      title="أمن البيانات والنسخ الاحتياطي"
      subtitle="توليد ملفات نسخ حماية شاملة أو استعادة البيانات السابقة."
    />

    <BaseCard class="mb-4">
      <CardHeader
        variant="neutral"
        icon="download"
        title="تصدير نسخة احتياطية"
      />
      <div class="card__body">
        <form
          class="flex gap-3 flex--end"
          @submit.prevent="$emit('create-backup', backupType)"
        >
          <!-- Replaced raw select with FormField -->
          <FormField
            label="نطاق التصدير"
            field-id="backupType"
            class="flex--1"
          >
            <select
              id="backupType"
              v-model="backupType"
              class="form-control form-control--select"
            >
              <option value="full">
                نسخة كاملة (ZIP)
              </option>
              <option value="json">
                السجلات دون ملفات المرفقات (JSON)
              </option>
            </select>
          </FormField>
          <BaseButton
            type="submit"
            variant="success"
            :loading="backupLoading"
          >
            <Icon icon="download" /> توليد وتحميل
          </BaseButton>
        </form>
      </div>
    </BaseCard>

    <DangerZone
      title="استيراد واستعادة النظام"
      description="قد تؤدي هذه العملية إلى مسح كافة السجلات الحالية. تأكد من اختيار الملف الصحيح."
    >
      <template #actions>
        <form
          class="flex flex--column gap-3"
          @submit.prevent="$emit('preview-restore', options)"
        >
          <FormField
            label="اختر ملف النسخ الاحتياطي"
            field-id="restoreFile"
            required
          >
            <input
              id="restoreFile"
              type="file"
              accept=".json,.zip"
              class="form-control"
              required
              @change="$emit('file-selected', $event.target.files[0])"
            >
          </FormField>

            <FormCheckbox
              v-model="options.patients"
              label="استيراد المرضى"
            />
            <FormCheckbox
              v-model="options.medications"
              label="استيراد الأدوية"
            />
            <FormCheckbox
              v-model="options.diagnoses"
              label="استيراد التشخيصات"
            />

          <p class="text-sm">استعادة المرضى تتطلب النسخة الكاملة: تشمل الحسابات والمواعيد والفواتير والإعدادات والسجلات السريرية. استعادة القوائم وحدها تدمجها وتحفظ السجلات الحالية.</p>
          <ConfirmCheckbox
            v-model="confirmClear"
            label="أوافق على مسح كافة السجلات الحالية."
            variant="danger"
          />

          <BaseButton
            type="submit"
            variant="warning"
            :disabled="!hasFile || !confirmClear"
            :loading="previewLoading"
          >
            <Icon icon="eye" /> معاينة الملف
          </BaseButton>
        </form>

        <div
          v-if="previewData"
          class="mt-4 p-3 border rounded border-warning"
        >
          <h4 class="heading-5 mb-2">
            نتيجة الفحص
          </h4>
          <div class="flex flex--wrap gap-3 mb-3">
            <Badge
              color="primary"
              variant="soft"
            >
              مرضى: {{ previewData.patients_count }}
            </Badge>
            <Badge
              color="success"
              variant="soft"
            >
              زيارات: {{ previewData.visits_count }}
            </Badge>
            <Badge
              color="purple"
              variant="soft"
            >
              أدوية: {{ previewData.medications_count }}
            </Badge>
            <Badge
              color="info"
              variant="soft"
            >
              ملفات: {{ previewData.media_files_count || 0 }}
            </Badge>
          </div>
          <p class="text-sm">
            الإصدار: {{ previewData.format_version || 'غير محدد' }}
          </p>
          <p class="text-sm">
            تاريخ الإنشاء: {{ previewData.created_at || 'غير محدد' }}
          </p>
          <form
            class="flex flex--column gap-2"
            @submit.prevent="$emit('execute-restore', { ...options, confirm_clear: true, confirmation_phrase: confirmationPhrase, preview_token: previewData.preview_token })"
          >
            <ConfirmCheckbox
              v-model="confirmExecute"
              label="تأكيد التدمير والاستعادة"
              variant="danger"
              class="mt-2"
            />
            <FormField
              label="اكتب RESTORE CLINIC للتأكيد"
              required
            >
              <input
                v-model="confirmationPhrase"
                class="form-control"
                autocomplete="off"
                dir="ltr"
              >
            </FormField>

            <BaseButton
              type="submit"
              variant="danger"
              :disabled="!confirmExecute || confirmationPhrase !== 'RESTORE CLINIC'"
              :loading="restoreLoading"
            >
              💥 تنفيذ الاستعادة
            </BaseButton>
          </form>
        </div>
      </template>
    </DangerZone>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import Badge from '@/components/ui/Badge.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import ConfirmCheckbox from '@/components/ui/ConfirmCheckbox.vue'
import DangerZone from '@/components/ui/DangerZone.vue'
import FormCheckbox from '@/components/ui/FormCheckbox.vue'
// Import FormField and FormCheckbox
import FormField from '@/components/ui/FormField.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

defineProps({
  backupLoading: { type: Boolean, default: false },
  previewLoading: { type: Boolean, default: false },
  restoreLoading: { type: Boolean, default: false },
  previewData: { type: Object, default: null },
  hasFile: { type: Boolean, default: false },
})

const emit = defineEmits(['create-backup', 'preview-restore', 'execute-restore', 'file-selected', 'preview-reset'])

const backupType = ref('full')
const confirmClear = ref(false)
const confirmExecute = ref(false)
const confirmationPhrase = ref('')
const options = ref({ patients: true, medications: true, diagnoses: true })
watch(options, () => { confirmExecute.value = false; emit('preview-reset') }, { deep: true })
</script>
