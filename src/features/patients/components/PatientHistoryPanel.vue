<template>
  <section aria-label="تاريخ تصحيحات السجل">
    <p>تُحفظ أسباب التصحيح والقيم السابقة واللاحقة دون تعديل النسخ الموقعة.</p>
    <ResourceFeedback :error="error" :loading="loading" loading-text="جاري تحميل التاريخ…" />
    <BaseButton :loading="loading" @click="load()">تحديث التاريخ</BaseButton>
    <article v-for="event in merges" :key="`merge-${event.id}`" class="card p-3 mt-3">
      <p>دمج اختياري: <bdi>{{ event.source }}</bdi> → <bdi>{{ event.survivor }}</bdi></p>
      <p>{{ event.actor }} · <DateCell :date="event.created_at" :relative="false" show-time empty-text="غير مسجل" /></p><p>{{ event.reason }}</p>
    </article>
    <article v-for="row in items" :key="row.id" class="card p-3 mt-3">
      <p><bdi>{{ row.patient_number }}</bdi> · {{ row.actor }} · <DateCell :date="row.created_at" :relative="false" show-time empty-text="غير مسجل" /></p><p>{{ row.reason }}</p>
      <dl class="patient-record-values">
        <template v-for="(change,key) in row.changes" :key="key">
          <dt>{{ labels[key] || 'معلومة في السجل' }}</dt><dd>{{ format(change.before) }} → {{ format(change.after) }}</dd>
        </template>
      </dl>
    </article>
    <p v-if="!loading && !items.length">لا توجد تصحيحات مسجلة.</p>
    <BaseButton v-if="items.length < total" :loading="loading" @click="load(true)">عرض المزيد</BaseButton>
  </section>
</template>
<script setup>
import { formatDisplayValue } from '@/utils/formatters'
import { onMounted,ref } from 'vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import DateCell from '@/components/ui/DateCell.vue'
import patientService from '@/features/patients/services/patientService'
import { recordKinds } from '@/features/patients/config/recordFields'
const props=defineProps({patientId:{type:Number,required:true}})
const items=ref([]),merges=ref([]),total=ref(0),loading=ref(false),error=ref('')
const labels=Object.assign({first_name:'الاسم الأول',father_name:'اسم الأب',surname:'العائلة',mother_name:'اسم الأم',dob_year:'سنة الميلاد',gender:'الجنس',national_id:'الرقم الوطني',phone:'الهاتف',permanent_address:'العنوان',marital_status:'الحالة الاجتماعية',is_active:'السجل الحالي'},...recordKinds.map(kind=>Object.fromEntries(kind.fields.map(field=>[field.name,field.label]))))
const format = formatDisplayValue
async function load(more=false){loading.value=true;error.value='';try{const data=await patientService.getCorrections(props.patientId,more?items.value.length:0);items.value=more?[...items.value,...data.items]:data.items;total.value=data.total;merges.value=data.merges||[]}catch{error.value='تعذر تحميل التاريخ'}finally{loading.value=false}}
onMounted(load)
</script>
