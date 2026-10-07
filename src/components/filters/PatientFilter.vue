<!-- frontend/src/features/patients/components/PatientFilter.vue -->
<template>
  <SearchInput
    :model-value="selectedPatient"
    :search-fn="searchPatients"
    :option-label="patientLabel"
    :option-key="(p) => p.id"
    :placeholder="field.placeholder || 'ابحث عن مريض...'"
    :min-length="2"
    variant="inline"
    @select="onSelect"
  />
</template>

<script setup>
import { ref } from 'vue'

import SearchInput from '@/components/common/SearchInput.vue'
import patientService from '@/features/patients/services/patientService'
import { unwrapResponse } from '@/services/apiClient'

defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const selectedPatient = ref(null)

function patientLabel(patient) {
  if (!patient) return ''

  return (
    patient.full_name ||
    [patient.first_name, patient.surname].filter(Boolean).join(' ')
  )
}

async function searchPatients(query) {
  const result = await patientService.search({
    search: query,
    limit: 5,
  })

  const payload = unwrapResponse(result)

  return payload?.patients || []
}

function onSelect(patient) {
  selectedPatient.value = patient
  emit('update:modelValue', patient ? patient.id : '')
}
</script>