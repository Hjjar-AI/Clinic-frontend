<!-- frontend/src/components/patient/PatientVisitsList.vue -->
<template>
  <section>
    <MedicationList
      v-if="latestVisit?.medications?.length"
      :medications="formattedMeds"
      variant="prescription"
    />

    <div class="flex flex--justify-between flex--center mb-2">
      <h2 class="heading-5 mb-0">
        الزيارات الطبية
      </h2>
      <router-link
        v-if="authStore.can('add_visit')"
        :to="{ name: 'VisitCreate', params: { patientId: patient.id } }"
        class="btn btn--primary btn--sm"
      >
        <Icon icon="plus" /> إضافة زيارة
      </router-link>
    </div>

    <div
      v-if="visits.length"
      class="visits-list"
    >
      <VisitCard
        v-for="visit in visits"
        :key="visit.id"
        :visit="visit"
        compact
        @click="goToVisit(visit.id)"
      >
        <template #actions>
          <button
            class="btn btn--secondary btn--xs"
            aria-label="عرض الزيارة"
            title="عرض الزيارة"
            @click.stop="goToVisit(visit.id)"
          >
            <Icon icon="eye" />
          </button>
          <button
            v-if="authStore.can('export_pdf')"
            class="btn btn--pdf btn--xs"
            aria-label="تصدير الزيارة PDF"
            title="تصدير الزيارة PDF"
            @click.stop="$emit('export-visit-pdf', visit.id)"
          >
            <Icon icon="file-pdf" />
          </button>
          <DuplicateVisitButton
            v-if="authStore.can('add_visit')"
            :visit-id="visit.id"
            :patient-id="patient.id"
          />
        </template>
      </VisitCard>
    </div>
    <EmptyState
      v-else
      type="visits"
      title="لا توجد زيارات"
      :action-url="`/patients/${patient.id}/visits/new`"
      action-text="إضافة زيارة"
    />
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

import DuplicateVisitButton from '@/components/common/DuplicateVisitButton.vue'
import VisitCard from '@/components/common/VisitCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import MedicationList from '@/features/clinical/components/MedicationList.vue'

defineProps({
  patient: { type: Object, required: true },
  visits: { type: Array, required: true },
  latestVisit: { type: Object, default: null },
  formattedMeds: { type: Array, default: () => [] }
})

defineEmits(['export-visit-pdf'])

const router = useRouter()
const authStore = useAuthStore()

function goToVisit(id) { if (id) router.push({ name: 'VisitDetail', params: { id } }) }
</script>
