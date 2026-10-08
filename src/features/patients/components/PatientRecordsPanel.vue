<template>
  <section aria-label="السجلات المستمرة للمريض">
    <FormField label="نوع السجل">
      <select v-model="kind" class="form-control">
        <option v-for="entry in availableKinds" :key="entry.key" :value="entry.key">{{ entry.label }}</option>
      </select>
    </FormField>
    <p class="text-muted">هذه معلومات مستمرة؛ لا تعدّل معلومات الزيارات أو المستندات الموقعة.</p>
    <AlertBar v-if="error" severity="danger" :title="error" />
    <p v-if="loading" role="status">جار تحميل السجلات…</p>
    <BaseButton v-if="canEdit && !editing" @click="start()">إضافة سجل</BaseButton>
    <form v-if="editing" class="card p-3 mt-3" @submit.prevent="save">
      <div v-if="operation === 'save'" class="grid-2">
        <FormField v-for="field in definition.fields" :key="field.name" :label="field.label" :required="field.required">
          <select v-if="options(field)" v-model="draft[field.name]" class="form-control" :required="field.required">
            <option :value="emptyValue(field)">غير محدد</option>
            <option v-for="option in options(field)" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.label }}</option>
          </select>
          <textarea v-else-if="field.type === 'textarea'" v-model="draft[field.name]" class="form-control" rows="3" />
          <input v-else-if="field.type === 'checkbox'" v-model="draft[field.name]" type="checkbox">
          <input v-else v-model="draft[field.name]" :type="field.type" :maxlength="field.maxLength" class="form-control" :required="field.required">
        </FormField>
      </div>
      <FormField label="سبب الإضافة أو التعديل أو إنهاء السجل" :required="!!selected || operation === 'retire'">
        <input v-model="reason" class="form-control" maxlength="500" :required="!!selected || operation === 'retire'">
      </FormField>
      <p v-if="operation === 'retire'">سيُحفظ السجل في التاريخ دون حذفه.</p>
      <div class="flex flex--wrap gap-2 mt-3">
        <BaseButton type="submit" :loading="saving">حفظ</BaseButton>
        <BaseButton variant="secondary" @click="editing = false">إلغاء</BaseButton>
      </div>
    </form>
    <div v-for="row in items" :key="row.id" class="card p-3 mt-3">
      <p v-if="!row.is_active" class="text-muted">سجل سابق: {{ row.retirement_reason }}</p>
      <p v-if="row.legacy_visit_follow_up" class="text-muted">متابعة مرتبطة بالزيارة؛ تعديل تاريخها ونتيجتها من شاشة الزيارة.</p>
      <dl class="patient-record-values">
        <template v-for="field in definition.fields" :key="field.name">
          <dt>{{ field.label }}</dt><dd>{{ display(row[field.name], field) }}</dd>
        </template>
      </dl>
      <p class="text-muted text-xs">أضيف: {{ row.created_at }} · آخر تعديل: {{ row.updated_at }}</p>
      <div v-if="canEdit && row.is_active && !row.legacy_visit_follow_up" class="flex flex--wrap gap-2">
        <BaseButton size="sm" @click="start(row)">تعديل</BaseButton>
        <BaseButton size="sm" variant="secondary" @click="start(row, 'retire')">إنهاء السجل</BaseButton>
      </div>
    </div>
    <p v-if="!loading && !items.length">لا توجد سجلات مدخلة؛ لا يعني ذلك تأكيد عدم وجود معلومات.</p>
    <BaseButton v-if="items.length < total" :loading="loading" @click="load(true)">عرض المزيد</BaseButton>
  </section>
</template>
<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FormField from '@/components/ui/FormField.vue'
import AlertBar from '@/components/ui/AlertBar.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import patientService from '@/features/patients/services/patientService'
import { recordKinds, defaultRecord } from '@/features/patients/config/recordFields'
const props = defineProps({ patient: { type:Object, required:true }, visits:{ type:Array, default:()=>[] }, appointments:{ type:Array, default:()=>[] }, members:{ type:Array, default:()=>[] } })
const emit = defineEmits(['changed'])
const auth = useAuthStore()
const availableKinds = computed(()=>recordKinds.filter(entry=>!entry.clinical || auth.can('view_visits')))
const route = useRoute()
const kind = ref(availableKinds.value.some(entry=>entry.key===route.query.kind) ? route.query.kind : 'identifiers')
const definition = computed(()=>availableKinds.value.find(entry=>entry.key===kind.value))
const canEdit = computed(()=>auth.can(definition.value?.clinical ? 'edit_visit' : 'edit_patient') && props.patient.is_active)
const items=ref([]), total=ref(0), loading=ref(false), saving=ref(false), error=ref(''), editing=ref(false), selected=ref(null), operation=ref('save'), reason=ref('')
const draft=reactive({})
let openingVersion = null
let generation = 0
function options(field) {
  if (field.options) return field.options
  if (field.type==='visit') return props.visits.map(row=>({value:row.id,label:`${row.visit_date} · #${row.id}`}))
  if (field.type==='appointment') return props.appointments.map(row=>({value:row.id,label:`${row.appointment_date} ${row.appointment_time}`}))
  if (field.type==='member') {
    const values=props.members.filter(row=>!row.ended_at).map(row=>({value:row.user,label:row.user_name}))
    if(draft[field.name] && !values.some(row=>row.value===draft[field.name])){const previous=props.members.find(row=>row.user===draft[field.name]);if(previous)values.push({value:previous.user,label:`${previous.user_name} (عضوية سابقة)`,disabled:true})}
    return values
  }
  return null
}
function emptyValue(field) { return ['date','visit','member','appointment'].includes(field.type) ? null : '' }
function display(value,field) { if(value===true)return 'نعم';if(value===false)return 'لا';return (field.type==='member' ? props.members.find(row=>row.user===value)?.user_name : options(field)?.find(row=>row.value===value)?.label) || value || 'غير معروف' }
function start(row=null, mode='save') {
  selected.value=row;operation.value=mode;reason.value='';editing.value=true;openingVersion=props.patient.version
  for(const key of Object.keys(draft)) delete draft[key]
  for(const field of definition.value.fields) draft[field.name]=row?.[field.name] ?? defaultRecord[field.name] ?? (field.name==='status' ? (kind.value==='allergies'?'suspected':kind.value==='medications'?'active':'pending') : field.type==='checkbox'?false:emptyValue(field))
}
async function load(more=false) {
  const current=++generation;const requestKind=kind.value
  loading.value=true;error.value=''
  try { const data=await patientService.getRecords(props.patient.id,requestKind,more?items.value.length:0);if(current!==generation)return;items.value=more?[...items.value,...data.items]:data.items;total.value=data.total;emit('changed',data.version) }
  catch { if(current===generation)error.value='تعذر تحميل السجلات. حاول مجدداً.' }
  finally { if(current===generation)loading.value=false }
}
async function save() {
  if(saving.value)return
  saving.value=true;error.value=''
  try {
    const fields=operation.value==='retire'?{}:{...draft}
    for(const field of definition.value.fields) if(field.type==='date' && fields[field.name]==='')fields[field.name]=null
    const data=await patientService.saveRecord(props.patient.id,{kind:kind.value,fields,record_id:selected.value?.id,operation:operation.value,reason:reason.value,version:openingVersion})
    editing.value=false;emit('changed',data.version,true);await load()
  } catch { error.value='تعذر الحفظ. تحقق من البيانات والصلاحيات؛ إذا تغير الملف فألغ التعديل وأعد تحميل السجلات.' }
  finally { saving.value=false }
}
onBeforeUnmount(()=>{generation++})
watch(kind,()=>{editing.value=false;items.value=[];load()},{immediate:true})
</script>
