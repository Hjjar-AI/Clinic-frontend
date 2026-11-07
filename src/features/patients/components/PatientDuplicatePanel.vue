<template>
  <section aria-label="مراجعة الملفات المتشابهة">
    <p>المراجعة والدمج اختياريان. تبقى أرقام الهوية كما أُدخلت، ويميز رقم الملف كل سجل.</p>
    <AlertBar v-if="error" severity="danger" :title="error" />
    <label class="block mb-2"><input v-model="includeReviewed" type="checkbox"> عرض النتائج التي تمت مراجعتها سابقاً</label>
    <BaseButton :loading="loading" @click="load">البحث عن ملفات متشابهة</BaseButton>
    <div v-for="match in matches" :key="match.id" class="card p-3 mt-3">
      <p>{{ match.full_name }} · <bdi>{{ match.patient_number }}</bdi> · {{ match.is_active ? 'نشط' : 'مؤرشف' }}</p>
      <p>سنة الميلاد: {{ match.dob_year || 'غير معروف' }} · الهوية: <bdi>{{ match.national_id || 'غير معروف' }}</bdi></p>
      <div class="flex flex--wrap gap-2">
        <BaseButton v-if="auth.can('edit_patient')" size="sm" :disabled="loading" @click="dismiss(match,'dismissed')">تجاهل الآن</BaseButton>
        <BaseButton v-if="auth.can('edit_patient')" size="sm" :disabled="loading" @click="dismiss(match,'different')">شخص مختلف</BaseButton>
        <BaseButton v-if="auth.user?.role === 'admin' && auth.can('delete_patient') && auth.can('edit_patient')" size="sm" :disabled="loading" @click="preview(match)">معاينة دمج هذا الملف في الملف الحالي</BaseButton>
      </div>
    </div>
    <p v-if="searched && !matches.length">لا توجد ملفات تحتاج مراجعة حالياً.</p>
    <BaseModal v-model="showPreview" title="مراجعة الدمج الاختياري">
      <template v-if="mergePreview">
        <p>المصدر: <bdi>{{ mergePreview.source }}</bdi> → الملف الباقي: <bdi>{{ mergePreview.survivor }}</bdi></p>
        <p>ستُنقل السجلات ويرتبط المصدر بالملف الحالي. ستُجمع عضويات فريق الرعاية الحالية، مما يوسع الوصول إلى الملف الموحّد. تبقى البيانات الديموغرافية للملف الحالي والتوقيعات والمستندات الموقعة دون تغيير.</p>
        <p>عدد السجلات المنقولة: {{ Object.values(mergePreview.counts).reduce((sum,value)=>sum+value,0) }}</p>
        <FormField label="سبب الدمج" required><textarea v-model="mergeReason" class="form-control" maxlength="500" /></FormField>
        <label><input v-model="confirmed" type="checkbox"> تحققت أن الملفين للشخص نفسه وأوافق على جمع السجلات وصلاحيات الفريق.</label>
      </template>
      <template #footer>
        <BaseButton :disabled="!confirmed || !mergeReason.trim()" :loading="loading" @click="merge">تنفيذ الدمج</BaseButton>
        <BaseButton variant="secondary" :disabled="loading" @click="showPreview=false">إلغاء</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
<script setup>
import { ref } from 'vue'
import AlertBar from '@/components/ui/AlertBar.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import patientService from '@/features/patients/services/patientService'
const props=defineProps({patient:{type:Object,required:true}})
const emit=defineEmits(['changed'])
const auth=useAuthStore()
const includeReviewed=ref(false)
const matches=ref([]),loading=ref(false),error=ref(''),searched=ref(false),showPreview=ref(false),mergePreview=ref(null),mergeReason=ref(''),confirmed=ref(false)
let sourceId=null
async function load(){loading.value=true;error.value='';try{const data=await patientService.findDuplicates({...props.patient,exclude_id:props.patient.id,include_reviewed:includeReviewed.value});matches.value=data.matches||[];searched.value=true}catch{error.value='تعذر البحث عن الملفات المتشابهة'}finally{loading.value=false}}
async function dismiss(match,status){loading.value=true;try{const data=await patientService.reviewDuplicate(props.patient.id,{other_id:match.id,status,reason:'مراجعة اختيارية من شاشة المريض',version:props.patient.version});emit('changed',data.version);matches.value=matches.value.filter(row=>row.id!==match.id)}catch{error.value='تعذرت المراجعة؛ أعد تحميل الملف'}finally{loading.value=false}}
async function preview(match){loading.value=true;error.value='';try{sourceId=match.id;mergePreview.value=await patientService.previewMerge(match.id,props.patient.id);mergeReason.value='';confirmed.value=false;showPreview.value=true}catch{error.value='تعذرت معاينة الدمج؛ أعد تحميل الملف'}finally{loading.value=false}}
async function merge(){if(!confirmed.value||!mergeReason.value.trim()||loading.value)return;loading.value=true;try{const data=await patientService.mergePatient(sourceId,{token:mergePreview.value.token,reason:mergeReason.value,version:mergePreview.value.version,target_version:mergePreview.value.target_version});showPreview.value=false;matches.value=[];emit('changed',data.version,true)}catch{error.value='تعذر الدمج أو تغيرت السجلات؛ ألغ المعاينة وأعد المحاولة'}finally{loading.value=false}}
</script>
