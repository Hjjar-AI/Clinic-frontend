<!-- frontend/src/features/patients/components/PatientDetailLayout.vue -->
<template>
  <PageContainer
    :status="status"
    @retry="$emit('retry')"
    empty-title="لا توجد بيانات"
    :empty-action-url="authStore.can('edit_patient') ? { name: 'PatientCreate' } : null"
    empty-action-text="إضافة مريض جديد"
  >
    <div
      v-if="patient"
      class="patient-detail-wrapper"
    >
      <!-- Sticky header area -->
      <div class="patient-sticky-header">
        <Breadcrumb />
        <PatientIdentity
          :patient-id="patient.id"
          :first-name="patient.first_name"
          :surname="patient.surname"
          :phone="patient.phone"
          :national-id="patient.national_id"
          :dob-year="patient.dob_year"
          :gender="patient.gender"
          :admission-date="patient.registration_date"
          :patient-number="patient.patient_number"
          @export-pdf="$emit('export-pdf', patient.id)"
          @export-word="$emit('export-word', patient.id)"
        />
        <p class="text-xs text-muted mb-2">
          آخر تحديث: <RelativeDate :date="patient.updated_at" />
        </p>
        <!-- Tabs -->
        <AppTabs v-model="activeTab">
          <AppTabPanel id="records" label="السجلات المستمرة" icon="address-card" />
          <AppTabPanel v-if="authStore.can('manage_patient_documents')" id="documents" label="المستندات" icon="file" />
          <AppTabPanel v-if="authStore.can('edit_patient')" id="duplicates" label="الملفات المتشابهة" icon="users" />
          <AppTabPanel id="history" label="تاريخ التصحيح" icon="history" />
          <AppTabPanel
            id="health"
            label="ملخص الصحة"
            icon="heartbeat"
          />
          <AppTabPanel
            id="appointments"
            label="المواعيد"
            icon="calendar-check"
          />
          <AppTabPanel
            id="team"
            label="فريق الرعاية"
            icon="user-md"
          />
        </AppTabs>
      </div>

      <!-- Scrollable content area -->
      <div class="patient-scrollable-content">
        <div class="grid grid--profile">
          <PatientSidebar
            :patient="patient"
            :latest-visit="latestVisit"
          />
          <div class="profile-main">
            <PatientRecordsPanel v-if="activeTab === 'records'" :patient="patient" :visits="visits" :appointments="appointments" :members="careTeamMembers" @changed="(...args) => $emit('record-changed', ...args)" />
            <PatientDocumentsPanel v-if="activeTab === 'documents' && authStore.can('manage_patient_documents')" :patient="patient" />
            <PatientDuplicatePanel v-if="activeTab === 'duplicates' && authStore.can('edit_patient')" :patient="patient" @changed="(...args) => $emit('record-changed', ...args)" />
            <PatientHistoryPanel v-if="activeTab === 'history'" :patient-id="patient.id" />
            <!-- Health tab content -->
            <div v-if="activeTab === 'health'">
              <DetailItem
                v-for="item in healthSummaryItems"
                :key="item.label"
                :label="item.label"
                :value="item.value"
                :numeric="item.numeric"
              />
            </div>
            <!-- Appointments tab content -->
            <div v-if="activeTab === 'appointments'">
              <div
                v-if="appointments.length"
                class="flex flex--column gap-2"
              >
                <div
                  v-for="apt in appointments"
                  :key="apt.id"
                  class="flex flex--justify-between flex--center p-2 border-bottom"
                >
                  <div>
                    <span class="font-bold text-primary">{{ apt.appointment_date }} - {{ apt.appointment_time }}</span>
                    <Badge
                      :status="apt.status"
                      status-type="appointment"
                      size="xs"
                      variant="soft"
                      class="ml-2"
                    />
                  </div>
                  <BaseButton
                    v-if="authStore.can('manage_appointments')"
                    variant="secondary"
                    size="xs"
                    @click="$emit('edit-appointment', apt.id)"
                  >
                    <Icon icon="edit" />
                  </BaseButton>
                </div>
              </div>
              <EmptyState
                v-else
                type="appointments"
                title="لا توجد مواعيد"
              />
              <div class="mt-3 flex gap-2">
                <BaseButton
                  v-if="authStore.can('manage_appointments')"
                  variant="primary"
                  size="sm"
                  :to="{ name: 'AppointmentCreate', query: { patientId: patient.id } }"
                >
                  <Icon icon="calendar-plus" /> حجز موعد
                </BaseButton>
              </div>
            </div>
            <!-- Team tab content -->
            <div v-if="activeTab === 'team'">
              <PatientCareTeamTab
                :patient-id="patient.id"
                :version="patient.version"
                :members="careTeamMembers"
                @remove="$emit('remove-care-team-member', $event)"
                @added="$emit('refresh-care-team')"
              />
            </div>

            <!-- Visits list (always visible below tabs) -->
            <PatientVisitsList
              :patient="patient"
              :visits="visits"
              :latest-visit="latestVisit"
              :formatted-meds="formattedMeds"
              @export-visit-pdf="$emit('export-visit-pdf', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import PageContainer from '@/components/layout/PageContainer.vue'
import AppTabPanel from '@/components/ui/AppTabPanel.vue'
import AppTabs from '@/components/ui/AppTabs.vue'
import Badge from '@/components/ui/Badge.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DetailItem from '@/components/ui/DetailItem.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import RelativeDate from '@/components/ui/RelativeDate.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import PatientRecordsPanel from '@/features/patients/components/PatientRecordsPanel.vue'
import PatientDocumentsPanel from '@/features/patients/components/PatientDocumentsPanel.vue'
import PatientDuplicatePanel from '@/features/patients/components/PatientDuplicatePanel.vue'
import PatientHistoryPanel from '@/features/patients/components/PatientHistoryPanel.vue'
import PatientCareTeamTab from '@/features/patients/components/PatientCareTeamTab.vue'
import PatientIdentity from '@/features/patients/components/PatientIdentity.vue'
import PatientSidebar from '@/features/patients/components/PatientSidebar.vue'
import PatientVisitsList from '@/features/patients/components/PatientVisitsList.vue'

defineProps({
  status: { type: String, required: true },
  patient: { type: Object, default: null },
  fullName: { type: String, default: '' },
  latestVisit: { type: Object, default: null },
  healthSummaryItems: { type: Array, required: true },
  appointments: { type: Array, required: true },
  careTeamMembers: { type: Array, required: true },
  visits: { type: Array, required: true },
  formattedMeds: { type: Array, required: true },
})

defineEmits([
  'record-changed', 'retry', 'export-pdf', 'export-word', 'edit-appointment',
  'remove-care-team-member', 'refresh-care-team', 'export-visit-pdf'
])

const route = useRoute()
const activeTab = ref(['health','appointments','team','records','documents','duplicates','history'].includes(route.query.tab) ? route.query.tab : 'health')  // default tab
const authStore = useAuthStore()
</script>
