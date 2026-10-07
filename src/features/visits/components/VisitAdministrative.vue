<template>
  <CollapsibleSection
    title="بيانات إدارية"
    icon="file-signature"
    :open="true"
    persist-key="visit-admin"
  >
    <div class="grid-2">
      <FormDate
        v-model="form.date_signed"
        label="تاريخ التوقيع"
      />
      <ApiSelect
        v-model="form.supervisor_id"
        url="/auth/users/doctors"
        value-key="id"
        label-key="full_name"
        label="المشرف"
      />
      <ApiSelect
        v-model="form.signed_by_id"
        url="/auth/users/doctors"
        value-key="id"
        label-key="full_name"
        label="المُوقِع"
      />
      <div class="flex flex--column gap-1">
        <label class="checkbox"><input
          v-model="form.diagnosis_discussed"
          type="checkbox"
          class="checkbox__input"
          aria-label="نوقش التشخيص"
        > نوقش التشخيص</label>
        <label class="checkbox"><input
          v-model="form.plan_discussed"
          type="checkbox"
          class="checkbox__input"
          aria-label="نوقشت الخطة"
        > نوقشت الخطة</label>
      </div>
    </div>
  </CollapsibleSection>
</template>

<script setup>
import ApiSelect from '@/components/ui/ApiSelect.vue'
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import FormDate from '@/components/ui/FormDate.vue'

defineProps({ form: Object })
</script>
