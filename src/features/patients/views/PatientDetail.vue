<template>
  <PatientDetailLayout
    :status="pageStatus"
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
import { computed, onMounted,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDate } from '@/composables/useDate'
import { useFormatters } from '@/composables/useFormatters'
import { useNotify } from '@/composables/useNotify'
import { usePageStatus } from '@/composables/usePageStatus'
import appointmentService from '@/features/appointments/services/appointmentService'
import PatientDetailLayout from '@/features/patients/components/PatientDetailLayout.vue'
import patientService from '@/features/patients/services/patientService'
import { usePatientStore } from '@/features/patients/stores/patients'
import { unwrapResponse } from '@/services/apiClient'
import { fullName as getFullName } from '@/utils/normalize'

const route = useRoute()
const router = useRouter()

const patientStore = usePatientStore()

const { formatDate, parseDate } = useDate()
const { toArabicNumerals: toArabic } = useFormatters()
const { notify } = useNotify()

const {
  status: pageStatus,
  setLoading,
  setContent,
  setError,
} = usePageStatus()

const patient = ref(null)
const visits = ref([])
const patientAppointments = ref([])
const careTeamMembers = ref([])

const latestVisit = computed(() => visits.value[0] || null)

const healthSummaryItems = computed(() => {
  const latest = latestVisit.value
  const diagnoses = latest?.diagnoses || []
  return [
    { label: 'إجمالي الزيارات', value: toArabic(visits.value.length), numeric: true },
    { label: 'آخر زيارة', value: latest ? formatDate(latest.visit_date) : 'لا توجد' },
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

onMounted(async () => {
  setLoading()

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
      const result = await patientService.getVisits(patient.value.id)
      const payload = unwrapResponse(result)
      const list = Array.isArray(payload) ? payload : payload?.items || []
      visits.value = [...list].sort((a, b) => {
        const da = parseDate(a.visit_date)
        const db = parseDate(b.visit_date)
        if (!da || !db) return 0
        return db.getTime() - da.getTime()
      })
      } catch {
        visits.value = []
      }
    }

    const loadAppointments = async () => {
      try {
      const result = await appointmentService.getByPatient(patient.value.id, { per_page: 10 })
      const payload = unwrapResponse(result)
      patientAppointments.value =
        payload?.items ||
        payload?.appointments ||
        (Array.isArray(payload) ? payload : [])
      } catch {
        patientAppointments.value = []
      }
    }

    await Promise.allSettled([loadVisits(), loadAppointments(), fetchCareTeam()])
  }

  setContent()
})

async function fetchCareTeam() {
  if (!patient.value) return
  try {
    const data = await patientService.getCareTeam(patient.value.id)
    careTeamMembers.value = data?.care_team || []
  } catch {
    careTeamMembers.value = []
  }
}

async function handleRemoveCareTeamMember(userId) {
  if (!patient.value) return
  try {
    await patientService.removeCareTeamMember(patient.value.id, userId)
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
