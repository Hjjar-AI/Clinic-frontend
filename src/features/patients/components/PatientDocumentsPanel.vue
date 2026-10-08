<template>
  <section aria-label="مستندات المريض">
    <AlertBar v-if="error" severity="danger" :title="error" />
    <BaseButton :loading="loading" @click="load">تحديث المستندات</BaseButton>
    <form v-if="patient.is_active" class="card p-3 mt-3" @submit.prevent="save">
      <FormField v-if="!selected" label="الملف" required><input type="file" required @change="file=$event.target.files[0]"></FormField>
      <p v-else>{{ selected.original_filename }}</p>
      <div class="grid-2">
        <FormField label="تاريخ المستند"><input v-model="draft.document_date" type="date" class="form-control"></FormField>
        <FormField label="المصدر"><input v-model="draft.source" class="form-control" maxlength="200"></FormField>
        <FormField label="الكاتب أو مقدم الخدمة"><input v-model="draft.provider" class="form-control" maxlength="200"></FormField>
        <FormField label="التحقق"><select v-model="draft.verification" class="form-control"><option value="unknown">غير معروف</option><option value="reported">مبلّغ</option><option v-if="auth.user?.role==='doctor'||auth.user?.role==='admin'" value="verified">تم التحقق</option></select></FormField>
        <FormField label="الفئة"><input v-model="draft.category" class="form-control" maxlength="50"></FormField>
        <FormField label="الوصف"><input v-model="draft.description" class="form-control" maxlength="200"></FormField>
      </div>
      <div class="flex flex--wrap gap-2 mt-3"><BaseButton type="submit" :loading="loading">{{ selected?'حفظ بيانات المستند':'رفع المستند' }}</BaseButton><BaseButton v-if="selected" variant="secondary" @click="reset">إلغاء</BaseButton></div>
    </form>
    <article v-for="row in documents" :key="row.id" class="card p-3 mt-3">
      <p>{{ row.original_filename }} · {{ row.document_date || 'تاريخ غير معروف' }}</p>
      <p>المصدر: {{ row.source || 'غير معروف' }} · مقدم الخدمة: {{ row.provider || 'غير معروف' }}</p>
      <p>{{ row.verification==='verified'?'تم التحقق':row.verification==='reported'?'معلومات مبلّغة':'التحقق غير معروف' }} · {{ row.description }}</p>
      <div class="flex flex--wrap gap-2"><BaseButton size="sm" @click="download(row)">تنزيل</BaseButton><BaseButton v-if="patient.is_active" size="sm" @click="edit(row)">تعديل البيانات</BaseButton><BaseButton v-if="patient.is_active" size="sm" variant="secondary" @click="archive(row)">أرشفة المستند</BaseButton></div>
    </article>
  </section>
</template>
<script setup>
import { onMounted,reactive,ref } from 'vue'
import FormField from '@/components/ui/FormField.vue'
import AlertBar from '@/components/ui/AlertBar.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/features/auth/stores/auth'
import patientService from '@/features/patients/services/patientService'
const props=defineProps({patient:{type:Object,required:true}})
const auth=useAuthStore(),{confirm}=useConfirmDialog()
const documents=ref([]),selected=ref(null),file=ref(null),loading=ref(false),error=ref('')
const draft=reactive({document_date:'',source:'',provider:'',verification:'unknown',category:'other',description:''})
let version=null
function reset(){selected.value=null;file.value=null;Object.assign(draft,{document_date:'',source:'',provider:'',verification:'unknown',category:'other',description:''})}
function edit(row){selected.value=row;version=row.version;for(const key of Object.keys(draft))draft[key]=row[key]||''}
async function load(){loading.value=true;try{const data=await patientService.getDocuments(props.patient.id);documents.value=Array.isArray(data)?data:data.items||data.results||[]}catch{error.value='تعذر تحميل المستندات'}finally{loading.value=false}}
async function save(){if(loading.value)return;loading.value=true;error.value='';try{if(selected.value){await patientService.updateDocument(props.patient.id,selected.value.id,{...draft,document_date:draft.document_date||null,version})}else{if(!file.value)throw new Error();const body=new FormData();body.append('file',file.value);for(const [key,value]of Object.entries(draft))if(key!=='document_date'||value)body.append(key,value);await patientService.uploadDocument(props.patient.id,body)}reset();await load()}catch{error.value='تعذر الحفظ؛ تحقق من البيانات أو أعد تحميل المستند بعد تعارض الإصدار'}finally{loading.value=false}}
async function archive(row){if(!await confirm('أرشفة المستند مع الاحتفاظ بالملف وتاريخه؟'))return;try{await patientService.archiveDocument(props.patient.id,row.id,row.version);await load()}catch{error.value='تعذرت أرشفة المستند؛ أعد تحميله'}}
async function download(row){try{const blob=await patientService.downloadDocument(props.patient.id,row.id);const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=row.original_filename;link.click();URL.revokeObjectURL(url)}catch{error.value='تعذر تنزيل المستند'}}
onMounted(load)
</script>
