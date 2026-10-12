<template>
  <ResourceFeedback :error="sectionErrors.join('؛ ')" retryable @retry="loadPatient" />
  <PatientDetailLayout
    :status="pageStatus"
    @retry="loadPatient"
    @record-changed="handleRecordChanged"
    :patient="patient"
    :full-name="fullName(patient)"
    :latest-visit="latestVisit"
    :health-summary-items="healthSummaryItems"
    :appointments="patientAppointments"
    :care-team-members="careTeamMembers"
    :visits="visits"
    :formatted-meds="formattedMeds"
    @export-pdf="exportPdf"
    @export-word="exportWord"
    @edit-appointment="router.push({ name: 'AppointmentEdit', params: { id: $event } })"
    @remove-care-team-member="handleRemoveCareTeamMember"
    @refresh-care-team="fetchCareTeam"
    @export-visit-pdf="exportVisitPdf"
  />
</template>

<script setup>
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { computed, onMounted,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDate } from '@/composables/useDate'
import { useFormatters } from '@/composables/useFormatters'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useNotify } from '@/composables/useNotify'
import { usePageStatus } from '@/composables/usePageStatus'
import { fetchCatalog } from '@/utils/catalogFetch'
import appointmentService from '@/features/appointments/services/appointmentService'
import PatientDetailLayout from '@/features/patients/components/PatientDetailLayout.vue'
import patientService from '@/features/patients/services/patientService'
import { usePatientStore } from '@/features/patients/stores/patients'
import { fullName as getFullName } from '@/utils/normalize'

const route = useRoute()
const router = useRouter()

const patientStore = usePatientStore()

const { formatDate, parseDate } = useDate()
const { toArabicNumerals: toArabic } = useFormatters()
const { notify } = useNotify()
const { prompt } = useConfirmDialog()

const {
  status: pageStatus,
  setLoading,
  setContent,
  setError,
} = usePageStatus()

const sectionErrors = ref([])
const patient = ref(null)
const visits = ref([])
const patientAppointments = ref([])
const careTeamMembers = ref([])

const latestVisit = computed(() => visits.value[0] || null)

const healthSummaryItems = computed(() => {
  const unavailable = sectionErrors.value.some(message => message.includes('الزيارات'))
  const latest = latestVisit.value
  const diagnoses = latest?.diagnoses || []
  return [
    { label: 'إجمالي الزيارات', value: unavailable ? 'غير متاح' : toArabic(visits.value.length), numeric: !unavailable },
    { label: 'آخر زيارة', value: unavailable ? 'غير متاح' : latest ? formatDate(latest.visit_date) : 'لا توجد' },
    { label: 'آخر تشخيص', value: diagnoses[0]?.arabic_name || diagnoses[0]?.name || 'غير محدد' },
    { label: 'مستوى الرعاية', value: latest?.level_of_care || 'غير محدد' },
    {
      label: 'المخاطر',
      value:
        latest?.suicide_risk_level === 'High' || latest?.violence_risk_level === 'High'
          ? 'مرتفع'
          : '—',
    },
  ]
})

const formattedMeds = computed(() => {
  const medications = latestVisit.value?.medications || []
  return medications.map((medication) => ({
    name: medication.display_name || medication.name || '',
    dosage: medication.dosage || '',
    schedule: medication.schedule || '',
    date: latestVisit.value?.visit_date || '',
  }))
})

function fullName(p) {
  return p ? getFullName(p) : ''
}

onMounted(loadPatient)

async function loadPatient() {
  setLoading()
  sectionErrors.value = []

  try {
    patient.value = await patientStore.fetchPatient(route.params.id)
  } catch {
    patient.value = null
    setError()
    return
  }

  if (patient.value) {
    const loadVisits = async () => {
      try {
      const list = await fetchCatalog(params => patientService.getVisits(patient.value.id, params), 'visits')
      visits.value = [...list].sort((a, b) => {
        const da = parseDate(a.visit_date)
        const db = parseDate(b.visit_date)
        if (!da || !db) return 0
        return db.getTime() - da.getTime()
      })
      } catch {
        visits.value = []
        sectionErrors.value.push('تعذر تحميل الزيارات')
      }
    }

    const loadAppointments = async () => {
      try {
      patientAppointments.value = await fetchCatalog(params => appointmentService.getByPatient(patient.value.id, params), 'appointments')
      } catch {
        patientAppointments.value = []
        sectionErrors.value.push('تعذر تحميل المواعيد')
      }
    }

    await Promise.allSettled([loadVisits(), loadAppointments(), fetchCareTeam()])
  }

  setContent()
}

async function fetchCareTeam() {
  if (!patient.value) return
  try {
    const data = await patientService.getCareTeam(patient.value.id)
    careTeamMembers.value = data?.care_team || []
    if (data?.version) patient.value.version = data.version
    patient.value = await patientStore.fetchPatient(patient.value.id)
  } catch {
    careTeamMembers.value = []
    sectionErrors.value.push('تعذر تحميل فريق الرعاية')
  }
}

async function handleRecordChanged(version, refresh = false) {
  if (!patient.value) return
  if (version) patient.value.version = version
  if (refresh) patient.value = await patientStore.fetchPatient(patient.value.id)
}

async function handleRemoveCareTeamMember(userId) {
  if (!patient.value) return
  try {
    const reason = await prompt('سبب إنهاء عضوية فريق الرعاية؟')
    if (!reason) return
    await patientService.removeCareTeamMember(patient.value.id, userId, patient.value.version, reason)
    notify('تمت إزالة العضو', 'success')
    fetchCareTeam()
  } catch {
    notify('فشل إزالة العضو', 'danger')
  }
}

async function exportPdf(id) {
  try {
    const blob = await patientStore.exportPdf(id)
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `patient_${id}.pdf`
    anchor.click()
    window.URL.revokeObjectURL(url)
  } catch {
    notify('فشل تصدير PDF', 'danger')
  }
}

async function exportWord(id) {
  try {
    const blob = await patientStore.exportWord(id)
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `patient_${id}.docx`
    anchor.click()
    window.URL.revokeObjectURL(url)
  } catch {
    notify('فشل تصدير Word', 'danger')
  }
}

function exportVisitPdf(visitId) {
  notify('جاري إنشاء ملف PDF للزيارة...', 'info')
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  window.open(`${base}/exports/visits/${visitId}/pdf/`, '_blank')
}
</script>
