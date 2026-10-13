<template>
  <section class="patient-workspace-header" :class="{ 'patient-workspace-header--summary': summaryOnly }" aria-label="سياق المريض والزيارة">
    <div v-if="!summaryOnly"><strong>{{ name }}</strong> · ملف <bdi dir="ltr">{{ patient.patient_number || patient.id }}</bdi> <Badge v-if="status" :status="status" status-type="visit" /></div>
    <p><strong>الحساسيات:</strong> {{ allergyLabel }} <span v-if="substances"> · {{ substances }}</span></p>
    <p v-if="loadError" role="status">تفاصيل الحساسيات غير متاحة. <button class="btn btn--secondary btn--sm" type="button" @click="load">إعادة المحاولة</button></p>
    <div v-if="!summaryOnly" class="flex flex--wrap gap-2">
      <BaseButton size="sm" :to="{ name: 'PatientDetail', params: { id: patient.id } }">ملف المريض</BaseButton>
      <BaseButton v-if="auth.can('view_visits') && auth.can('export_pdf')" size="sm" :to="{ name: 'PatientDetail', params: { id: patient.id }, query: { tab: 'prescriptions' } }">الوصفات المحفوظة</BaseButton>
    </div>
  </section>
</template>
<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import Badge from '@/components/ui/Badge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import patientService from '@/features/patients/services/patientService'
import { onSessionChange, sessionGeneration } from '@/services/sessionState'
const props = defineProps({ patient: { type: Object, required: true }, status: { type: String, default: '' }, summaryOnly: Boolean })
const auth = useAuthStore()
const currentProfile = ref(null)
const profile = computed(() => currentProfile.value || props.patient)
const name = computed(() => profile.value.full_name || profile.value.name || [profile.value.first_name, profile.value.surname].filter(Boolean).join(' '))
const allergyLabel = computed(() => ({ unknown: 'غير معروف', none_known: 'لا توجد حساسيات معروفة', recorded: 'حساسيات مسجلة' })[profile.value.allergy_status] || 'غير معروف')
const allergies = ref([]), loadError = ref(false)
let generation = 0, disposed = false
const substances = computed(() => allergies.value.filter(item => item.is_active !== false).slice(0, 3).map(item => item.substance).filter(Boolean).join('، '))
function clear() { generation += 1; currentProfile.value = null; allergies.value = []; loadError.value = false }
const remove = onSessionChange(clear)
onBeforeUnmount(() => { disposed = true; clear(); remove() })
watch(() => [props.patient.id, props.patient.version, props.patient.allergy_status], () => { clear(); load() }, { immediate: true })
async function load() {
  if (!auth.can('view_visits')) return
  const request = ++generation, epoch = sessionGeneration()
  loadError.value = false
  try {
    if (!('allergy_status' in props.patient)) {
      const result = await patientService.getById(props.patient.id)
      if (disposed || request !== generation || epoch !== sessionGeneration()) return
      currentProfile.value = result
    }
    if (profile.value.allergy_status !== 'recorded') return
    const result = await patientService.getRecords(props.patient.id, 'allergies')
    if (!disposed && request === generation && epoch === sessionGeneration()) allergies.value = result.items || []
  }
  catch { if (!disposed && request === generation && epoch === sessionGeneration()) loadError.value = true }
}
</script>
