<template>
  <CollapsibleSection
    title="خطة العلاج"
    icon="pills"
    :open="true"
    persist-key="visit-treat"
  >
    <MultiSelect
      v-model="form.medications"
      mode="inline"
      :search-fn="searchMedicationsFn"
      :option-label="(m) => m.display_name || m.generic_arabic || m.generic_english"
      :option-key="(m) => m.id || m.name"
      :initial-options="medicationsInitial"
      placeholder="ابحث عن دواء..."
      custom-label="دواء مخصص"
    />
    <div class="grid-2">
      <FormTextarea
        v-model="form.treatment_text"
        label="توصيات علاجية"
        rows="2"
      />
      <FormTextarea
        v-model="form.doctor_notes"
        label="ملاحظات الطبيب"
        rows="3"
      />
    </div>
    <FormDate
      v-model="form.follow_up_date"
      label="تاريخ المتابعة"
    />

    <h5 class="heading-5 mt-4 mb-2">
      أهداف العلاج
    </h5>
    <div
      v-for="(goal, idx) in (form.goals || [])"
      :key="idx"
      class="flex gap-2 mb-2"
    >
      <input
        v-model="goal.title"
        class="form-control form-control--small"
        placeholder="الهدف"
      >
      <ScoreInput
        v-model.number="goal.percentage"
        :max="100"
        label=""
      />
      <BaseButton
        variant="danger"
        size="xs"
        @click="$emit('remove-goal', idx)"
      >
        ×
      </BaseButton>
    </div>
    <BaseButton
      variant="secondary"
      size="sm"
      @click="$emit('add-goal')"
    >
      + إضافة هدف
    </BaseButton>

    <h5 class="heading-5 mt-4 mb-2">
      تقييم المخاطر
    </h5>
    <div class="grid-2">
      <FormField
        label="خطر الانتحار"
        required
        :error="errors.suicide_risk_level"
      >
        <SegmentedControl
          v-model="form.suicide_risk_level"
          :options="riskOptions"
        />
      </FormField>
      <FormField
        label="خطر العنف"
        required
        :error="errors.violence_risk_level"
      >
        <SegmentedControl
          v-model="form.violence_risk_level"
          :options="riskOptions"
        />
      </FormField>
    </div>
    <label class="checkbox mt-2"><input
      v-model="form.firearm_access"
      type="checkbox"
      class="checkbox__input"
      aria-label="حيازة سلاح ناري"
    > حيازة سلاح ناري</label>

    <div class="grid-2 mt-3">
      <FormField label="مستوى الرعاية">
        <select
          v-model="form.level_of_care"
          class="form-control form-control--select"
        >
          <option value="">
            غير محدد
          </option>
          <option>Outpatient</option><option>IOP</option><option>PHP</option>
          <option>Inpatient</option><option>Residential</option>
          <option>Voluntary</option><option>Involuntary</option>
        </select>
      </FormField>
      <FormField label="نوع المتابعة">
        <select
          v-model="form.follow_up_type"
          class="form-control form-control--select"
        >
          <option value="">
            غير محدد
          </option>
          <option>In-person</option><option>Telehealth</option><option>Phone</option>
        </select>
      </FormField>
    </div>

    <BaseCard class="p-3 mb-2 mt-3">
      <select
        v-model="selectedTemplate"
        class="form-control form-control--select mb-2"
        aria-label="قالب خطة العلاج"
      >
        <option value="">
          -- اختر قالباً --
        </option>
        <option
          v-for="t in templates"
          :key="t.id"
          :value="t.id"
        >
          {{ t.name }}
        </option>
      </select>
      <BaseButton
        variant="secondary"
        size="sm"
        block
        @click="$emit('apply-template', selectedTemplate)"
      >
        تطبيق القالب
      </BaseButton>
    </BaseCard>
  </CollapsibleSection>
</template>

<script setup>
import { ref } from 'vue'

import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import FormDate from '@/components/ui/FormDate.vue'
import FormField from '@/components/ui/FormField.vue'
import FormTextarea from '@/components/ui/FormTextarea.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import ScoreInput from '@/components/ui/ScoreInput.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'

defineProps({
  form: Object,
  searchMedicationsFn: Function,
  medicationsInitial: Array,
  riskOptions: Array,
  templates: Array,
  errors: { type: Object, default: () => ({}) },
})

defineEmits(['remove-goal', 'add-goal', 'apply-template'])
const selectedTemplate = ref('')
</script>
