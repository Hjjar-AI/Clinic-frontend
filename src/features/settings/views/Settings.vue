<template>
  <PageContainer status="content" class="settings-view">
    <Breadcrumb />
    <PageHeader
      title="الإعدادات العامة"
      subtitle="ضبط المظهر والتفضيلات وسلوك النظام."
    />

    <WorkspacePreferences />
    <BaseCard>
      <div class="card__body">
        <CollapsibleSection
          title="معلومات العيادة"
          icon="clinic-medical"
          :open="true"
        >
          <div class="grid-2 gap-3">
            <FormInput v-model="form.clinic_name" label="اسم العيادة" />
            <FormInput v-model="form.clinic_address" label="عنوان العيادة" />
            <FormInput v-model="form.clinic_phone" label="هاتف العيادة" type="tel" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="البيانات الموصى باستكمالها" icon="user">
          <p>اختيار هذه البيانات يحسب اكتمال الملف فقط؛ لا يجعلها إلزامية عند التسجيل.</p>
          <MultiSelect v-model="form.patient_completeness_fields" :options="completenessOptions" />
        </CollapsibleSection>
        <CollapsibleSection
          title="الإشعارات والتذكيرات"
          icon="bell"
        >
          <div class="grid-3 gap-3">
            <FormInput
              v-model.number="form.appointment_reminder_days"
              :error="fieldErrors.appointment_reminder_days"
              type="number"
              min="0"
              max="30"
              label="تذكير الموعد قبل (أيام)"
            />
            <FormInput
              v-model.number="form.appointment_reminder_hours"
              :error="fieldErrors.appointment_reminder_hours"
              type="number"
              min="1"
              max="12"
              label="التذكير القريب قبل (ساعات)"
            />
            <FormInput
              v-model.number="form.task_reminder_days"
              :error="fieldErrors.task_reminder_days"
              type="number"
              min="0"
              max="30"
              label="تذكير المهمة قبل (أيام)"
            />
          </div>
          <p class="text-xs text-muted">القيم الافتراضية: يوم واحد، ساعة واحدة، يوم واحد.</p>
        </CollapsibleSection>

        <CollapsibleSection
          title="المظهر"
          icon="palette"
        >
          <ThemeSwitcher
            :model-value="theme"
            @update:model-value="onThemeChange"
          />
        </CollapsibleSection>

        <CollapsibleSection
          v-if="authStore.can('manage_users')"
          title="روابط سريعة للإدارة"
          icon="link"
        >
          <div class="flex flex--wrap gap-2">
            <BaseButton
              variant="secondary"
              size="sm"
              :to="{ name: 'ScalesAdmin' }"
            >
              <Icon icon="chart-line" /> المقاييس
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :to="{ name: 'DiagnosesManage' }"
            >
              <Icon icon="diagnoses" /> التشخيصات
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :to="{ name: 'MedicationsManage' }"
            >
              <Icon icon="pills" /> الأدوية
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :to="{ name: 'Users' }"
            >
              <Icon icon="users" /> المستخدمين
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :to="{ name: 'BackupView' }"
            >
              <Icon icon="shield-alt" /> النسخ الاحتياطي
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :to="{ name: 'ImportData' }"
            >
              <Icon icon="upload" /> استيراد
            </BaseButton>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          v-if="allowDemoData"
          title="بيانات تجريبية"
          icon="vial"
        >
          <BaseButton
            variant="warning"
            :loading="demoLoading"
            @click="generateDemo"
          >
            <Icon icon="vial" /> إنشاء بيانات تجريبية
          </BaseButton>
        </CollapsibleSection>

        <div class="p-4 border-top">
          <BaseButton
            variant="primary"
            size="lg"
            :loading="saving"
            @click="saveSettings"
          >
            <Icon icon="save" /> حفظ جميع الإعدادات
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </PageContainer>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import FormInput from '@/components/ui/FormInput.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import WorkspacePreferences from '@/features/settings/components/WorkspacePreferences.vue'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher.vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { useApi } from '@/composables/useApi'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useFormDirty } from '@/composables/useFormDirty'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/features/auth/stores/auth'
import settingsService from '@/features/settings/services/settingsService'
import { useSettingsStore } from '@/features/settings/stores/settings'
import { CONFIRM } from '@/utils/confirmMessages'

const store = useSettingsStore()
const { theme } = useAppTheme()
const authStore = useAuthStore()
const { notify } = useNotify()
const { confirm } = useConfirmDialog()

const completenessOptions = [{value:'dob_year',label:'سنة الميلاد'},{value:'gender',label:'الجنس'},{value:'registration_date',label:'تاريخ التسجيل'},{value:'national_id',label:'الرقم الوطني'},{value:'phone',label:'الهاتف'},{value:'care_team',label:'فريق الرعاية'},{value:'preferred_language',label:'اللغة المفضلة'}]
const allowDemoData = ref(false)
const form = ref({
  clinic_name: '',
  clinic_address: '',
  clinic_phone: '',
  appointment_reminder_days: 1,
  appointment_reminder_hours: 1,
  task_reminder_days: 1,
  patient_completeness_fields: ['dob_year','gender','registration_date'],
})
const isDirty = ref(false)
const fieldErrors = ref({})

watch(form, () => { isDirty.value = true }, { deep: true })
useFormDirty(isDirty)

onMounted(async () => {
  await store.fetchSettings()
  form.value = { ...store.settings }
  isDirty.value = false

  try {
    const inner = await settingsService.getSystemConfig()
    if (inner && typeof inner.allow_demo_data === 'boolean') {
      allowDemoData.value = inner.allow_demo_data
    }
  } catch { /* Keep the dangerous demo-data action hidden on uncertainty. */ }
})

async function onThemeChange(theme) {
  try {
    await store.setTheme(theme)
    form.value.theme = theme
    form.value.version = store.settings.version
  } catch {
    notify('فشل تغيير السمة', 'danger')
  }
}

const { loading: saving, execute: doSave } = useApi(
  () => store.updateSettings(form.value),
  {
    silent: true,
    onSuccess: () => {
      notify('تم الحفظ', 'success')
      form.value = { ...store.settings }
      isDirty.value = false
    },
  }
)

const { loading: demoLoading, execute: doDemo } = useApi(
  () => store.generateDemoData(),
  { onSuccess: () => notify('تم الإنشاء', 'success') }
)

async function saveSettings() {
  if (saving.value) return
  const errors = {}
  for (const [key, min, max] of [['appointment_reminder_days', 0, 30], ['appointment_reminder_hours', 1, 12], ['task_reminder_days', 0, 30]]) {
    const value = form.value[key]
    if (value === '' || value == null || !Number.isInteger(Number(value)) || Number(value) < min || Number(value) > max) errors[key] = `أدخل عدداً صحيحاً بين ${min} و${max}`
  }
  fieldErrors.value = errors
  if (Object.keys(errors).length) return
  try { await doSave() } catch { notify('تعذر حفظ الإعدادات', 'danger') }
}

const generateDemo = async () => {
  const ok = await confirm(CONFIRM.GENERATE_DEMO)
  if (ok) doDemo()
}
</script>
