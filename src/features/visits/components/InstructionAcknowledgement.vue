<template>
  <section aria-label="شرح تعليمات المريض">
    <h3 class="heading-6">شرح تعليمات المريض</h3>
    <FormCheckbox :model-value="Boolean(ack)" label="تم شرح التعليمات" @update:model-value="toggle" />
    <div v-if="ack" class="grid-2 gap-3">
      <FormInput v-model="localTime" label="وقت الشرح (بتوقيت جهازك)" type="datetime-local" />
      <FormSelect v-model="ack.recipient" label="لمن شُرحت التعليمات" :options="[{ value: 'patient', label: 'المريض' }, { value: 'representative', label: 'المرافق / الممثل' }, { value: 'both', label: 'كلاهما' }]" />
      <FormInput v-model="ack.recipient_name" label="اسم المتلقي إن لزم" :maxlength="150" />
      <FormField label="هل احتاج توضيحاً إضافياً؟" :field-id="clarificationId"><select :id="clarificationId" v-model="ack.clarification_needed" class="form-control"><option :value="null">غير مسجل</option><option :value="true">نعم</option><option :value="false">لا</option></select></FormField>
      <FormTextarea v-model="ack.notes" label="التوضيح والملاحظات" :maxlength="2000" />
    </div>
  </section>
</template>
<script setup>
import { computed, useId } from 'vue'
import FormCheckbox from '@/components/ui/FormCheckbox.vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import FormTextarea from '@/components/ui/FormTextarea.vue'
import FormField from '@/components/ui/FormField.vue'
const props = defineProps({ form: { type: Object, required: true } })
const clarificationId = `instruction-clarification-${useId()}`
const ack = computed(() => props.form.clinical_data?.instruction_acknowledgement)
function toggle(value) {
  props.form.clinical_data = { ...props.form.clinical_data, instruction_acknowledgement: value ? { explained_at: new Date().toISOString(), recipient: 'patient', recipient_name: '', clarification_needed: null, notes: '' } : null }
}
const localTime = computed({
  get() { const date = new Date(ack.value?.explained_at); if (!Number.isFinite(date.getTime())) return ''; const pad = value => String(value).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}` },
  set(value) { const date = new Date(value); ack.value.explained_at = Number.isFinite(date.getTime()) ? date.toISOString() : '' },
})
</script>
