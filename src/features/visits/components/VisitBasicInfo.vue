<template>
  <CollapsibleSection
    title="البيانات الأساسية"
    icon="info-circle"
    :open="true"
    persist-key="visit-basic"
  >
    <div class="grid-2">
      <FormDate
        v-model="form.visit_date"
        label="تاريخ الزيارة"
        required
        :error="errors.visit_date"
      />
      <FormField label="العمر">
        <input
          :value="ageDisplay"
          readonly
          class="form-control text-muted"
        >
      </FormField>
    </div>
    <div class="grid-2">
      <ClinicalTextArea
        v-model="form.main_complaints"
        label="الشكوى الرئيسية"
        required
        :maxlength="500"
        rows="2"
      />
      <ClinicalTextArea
        v-model="form.history_presenting_complaint"
        label="القصة المرضية"
        :maxlength="2000"
        rows="2"
      />
    </div>
    <div class="grid-2">
      <ScoreInput
        v-model.number="form.pain_level"
        label="مستوى الألم"
        :max="10"
      />
      <ScoreInput
        v-model.number="form.anxiety_level"
        label="مستوى القلق"
        :max="10"
      />
    </div>
    <div class="grid-2">
      <FormField label="المرافقة">
        <select
          v-model="form.accompanied_by"
          class="form-control form-control--select"
        >
          <option value="alone">
            بمفرده
          </option>
          <option value="companion">
            مع مرافق
          </option>
        </select>
      </FormField>
      <FormField
        v-if="form.accompanied_by === 'companion'"
        label="صلة القرابة"
      >
        <input
          v-model="form.companion_relation"
          class="form-control"
        >
      </FormField>
    </div>
    <FormField label="وضع الحالة">
      <select
        v-model="form.clinical_status"
        class="form-control form-control--select"
      >
        <option value="">
          -- اختر --
        </option>
        <option value="تحسن">
          تحسن
        </option>
        <option value="تحسن جزئي">
          تحسن جزئي
        </option>
        <option value="غير مستقر">
          غير مستقر
        </option>
        <option value="انتكاس مع أخذ الدواء">
          انتكاس مع أخذ الدواء
        </option>
        <option value="انتكاس بعد ترك الدواء">
          انتكاس بعد ترك الدواء
        </option>
      </select>
    </FormField>
  </CollapsibleSection>
</template>

<script setup>
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import FormDate from '@/components/ui/FormDate.vue'
import FormField from '@/components/ui/FormField.vue'
import ScoreInput from '@/components/ui/ScoreInput.vue'
import ClinicalTextArea from '@/features/clinical/components/ClinicalTextArea.vue'

defineProps({
  form: Object,
  errors: Object,
  ageDisplay: String
})
</script>
