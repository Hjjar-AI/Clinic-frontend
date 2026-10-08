<template>
  <div>
    <h4 class="heading-5 border-bottom pb-2 mb-3 text-primary">
      أولاً: البيانات الديموغرافية
    </h4>
    <div class="grid-2 gap-3 mb-4">
      <FormInput
        v-model="form.first_name"
        label="الاسم الأول"
        required
        :error="errors.first_name"
        :valid="fieldStates.first_name === 'valid'"
        placeholder="أدخل الاسم الأول..."
      />
      <FormInput
        v-model="form.surname"
        label="اسم العائلة / الكنية"
        required
        :error="errors.surname"
        :valid="fieldStates.surname === 'valid'"
        placeholder="أدخل اسم العائلة..."
      />
    </div>

    <div class="grid-3 gap-3 mb-4">
      <FormSelect
        v-model="form.gender"
        label="الجنس (إن كان معروفاً)"
        :error="errors.gender"
        :valid="fieldStates.gender === 'valid'"
        :options="genderOptions"
        placeholder="اختر الجنس..."
      />
      <FormSelect
        v-model="form.dob_year"
        label="سنة الميلاد (إن كانت معروفة)"
        :error="errors.dob_year"
        :valid="fieldStates.dob_year === 'valid'"
        :options="yearOptions"
        placeholder="اختر السنة..."
      />
      <FormInput
        v-model="form.phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        direction="ltr"
        label="رقم الجوال (إن وجد)"
        :error="errors.phone"
        :valid="fieldStates.phone === 'valid'"
        placeholder="05xxxxxxxx"
      />
    </div>

    <div class="grid-2 gap-3 mb-4">
      <FormSelect
        v-model="form.marital_status"
        label="الحالة الاجتماعية"
        :error="errors.marital_status"
        :valid="fieldStates.marital_status === 'valid'"
        :options="maritalStatusOptions"
        placeholder="اختر الحالة..."
      />
    </div>
  </div>
</template>

<script setup>
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'

defineProps({
  form: Object,
  errors: Object,
  fieldStates: Object,
  genderOptions: Array,
  yearOptions: Array,
  maritalStatusOptions: Array,
})
</script>