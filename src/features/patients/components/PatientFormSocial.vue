<template>
  <div>
    <h4 class="heading-5 border-bottom pb-2 mb-3 text-purple mt-4">
      ثانياً: الخلفية الاجتماعية والمهنية
    </h4>
    <div class="grid-2 gap-3 mb-4">
      <FormInput
        v-model="form.occupation"
        label="المهنة الحالية"
        placeholder="طبيعة العمل الحالي..."
      />
      <FormInput
        v-model="form.address"
        label="العنوان / مكان الإقامة"
        placeholder="المدينة، الحي..."
      />
    </div>

    <div class="grid-2 gap-3 mb-4">
      <FormInput
        v-model="form.national_id"
        label="الرقم الوطني"
        :error="errors.national_id"
        :valid="fieldStates.national_id === 'valid'"
        placeholder="10-12 أرقام"
      />
      <FormDate
        v-model="form.admission_date"
        label="تاريخ الإضافة (اختياري)"
      />
    </div>
  </div>
</template>

<script setup>
import FormDate from '@/components/ui/FormDate.vue'
import FormInput from '@/components/ui/FormInput.vue'

defineProps({
  form: Object,
  errors: Object,
  fieldStates: Object,
})
</script>