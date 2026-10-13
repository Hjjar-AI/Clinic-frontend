<template>
  <CollapsibleSection id="visit-administration" tabindex="-1"
    title="بيانات إدارية"
    icon="file-signature"
    :open="true"
    persist-key="visit-admin"
  >
    <div class="grid-2">
      <FormDate
        v-model="form.date_signed"
        label="تاريخ التوقيع (يحدده النظام)"
        disabled
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
        label="المُوقِع (يحدده النظام)"
        disabled
      />
      <FormField label="نوقش التشخيص"><select v-model="form.diagnosis_discussed" class="form-control"><option :value="null">غير مسجل</option><option :value="true">نعم</option><option :value="false">لا</option></select></FormField>
      <FormField label="نوقشت الخطة"><select v-model="form.plan_discussed" class="form-control"><option :value="null">غير مسجل</option><option :value="true">نعم</option><option :value="false">لا</option></select></FormField>

    </div>
    <InstructionAcknowledgement :form="form" />
  </CollapsibleSection>
</template>

<script setup>
import InstructionAcknowledgement from '@/features/visits/components/InstructionAcknowledgement.vue'
import ApiSelect from '@/components/ui/ApiSelect.vue'
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue'
import FormField from '@/components/ui/FormField.vue'
import FormDate from '@/components/ui/FormDate.vue'

defineProps({ form: Object })
</script>
