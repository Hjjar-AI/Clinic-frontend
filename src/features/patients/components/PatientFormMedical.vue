<template>
  <div>
    <h4 class="heading-5 border-bottom pb-2 mb-3 text-purple mt-4">
      ثالثاً: المعلومات الطبية الهامة
    </h4>
    <div class="grid-2 gap-3 mb-4">
      <FormTextarea
        v-model="form.family_history"
        label="التاريخ العائلي"
        :maxlength="500"
        rows="3"
      />
      <FormTextarea
        v-model="form.important_notes"
        label="ملاحظات هامة"
        :maxlength="500"
        rows="3"
      />
    </div>
  </div>
</template>

<script setup>
import FormTextarea from '@/components/ui/FormTextarea.vue'

defineProps({ form: Object })
</script>