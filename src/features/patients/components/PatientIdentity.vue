<!-- frontend/src/features/patients/components/PatientIdentity.vue -->
<template>
  <div
    v-if="compact"
    class="visit-patient-info"
  >
    <span>{{ displayName }}</span>
    <span>|</span>
    <span><strong>ر.و:</strong> {{ nationalIdDisplay }}</span>
    <span>|</span>
    <span><strong>س.م:</strong> {{ dobYear || NOT_SPECIFIED }}</span>
    <span v-if="age">|</span>
    <span v-if="age"><strong>العمر:</strong> {{ age }} سنة</span>
    <span>|</span>
    <span><strong>الجنس:</strong> {{ gender || NOT_SPECIFIED }}</span>
    <span>|</span>
    <span><strong>📞</strong> {{ phoneDisplay }}</span>
    <span>|</span>
    <span><strong>تاريخ الإضافة:</strong> {{ normalizedAdmission }}</span>
  </div>
  <div
    v-else
    class="card border-accent-start mb-4"
  >
    <div class="card__body">
      <div
        class="flex flex--justify-between flex--center flex--wrap"
        style="gap: var(--space-4)"
      >
        <div
          class="flex flex--align-center"
          style="gap: var(--space-4)"
        >
          <Avatar
            size="lg"
            color="primary"
            :name="displayName"
          />
          <div>
            <h2 class="heading-3 m-0">
              {{ displayName }}
            </h2>
            <p class="text-xs text-muted">
              رقم الملف: #{{ patientId }}
            </p>
            <div class="flex flex--wrap gap-2 mt-2 text-xs text-soft">
              <span><strong>الهاتف:</strong> {{ phoneDisplay }}</span>
              <span><strong>الرقم الوطني:</strong> {{ nationalIdDisplay }}</span>
              <span><strong>س.م:</strong> {{ dobYear || NOT_SPECIFIED }}</span>
              <span v-if="age"><strong>العمر:</strong> {{ age }} سنة</span>
              <span><strong>الجنس:</strong> {{ gender || NOT_SPECIFIED }}</span>
              <span><strong>تاريخ الإضافة:</strong> {{ normalizedAdmission }}</span>
            </div>
          </div>
        </div>
        <div
          class="flex flex--gap-2 flex--wrap"
          style="gap: var(--space-1)"
        >
          <BaseButton
            v-if="authStore.can('add_visit')"
            variant="success"
            :to="{ name: 'VisitCreate', params: { patientId: patientId } }"
          >
            <Icon icon="file-medical" /> زيارة جديدة
          </BaseButton>
          <BaseButton
            v-if="authStore.can('edit_patient')"
            variant="secondary"
            :to="{ name: 'PatientEdit', params: { id: patientId } }"
          >
            <Icon icon="edit" /> تعديل
          </BaseButton>
          <BaseButton
            v-if="authStore.can('export_pdf')"
            variant="danger"
            @click="$emit('export-pdf', patientId)"
          >
            <Icon icon="file-pdf" /> PDF
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import Avatar from '@/components/ui/Avatar.vue';
import { useDate } from '@/composables/useDate';
import { useFormatters } from '@/composables/useFormatters';
import { useAuthStore } from '@/features/auth/stores/auth';
import { NOT_SPECIFIED } from '@/utils/fallbackText';
import { fullName } from '@/utils/normalize';

const props = defineProps({
  patientId: [Number, String],
  firstName: String,
  surname: String,
  phone: String,
  nationalId: String,
  dobYear: [Number, String],
  gender: String,
  admissionDate: String,
  compact: { type: Boolean, default: false },
});

const authStore = useAuthStore();

defineEmits(['export-pdf', 'export-word']);

const displayName = computed(() => fullName({ first_name: props.firstName, surname: props.surname }));
const { normalizeDate } = useDate();
const normalizedAdmission = computed(() => normalizeDate(props.admissionDate));
const { formatPhone, formatNationalId } = useFormatters();

const phoneDisplay = computed(() => (props.phone ? formatPhone(props.phone) : NOT_SPECIFIED));
const nationalIdDisplay = computed(() => (props.nationalId ? formatNationalId(props.nationalId) : NOT_SPECIFIED));

const age = computed(() => {
  if (!props.dobYear) return null;
  return new Date().getFullYear() - parseInt(props.dobYear);
});
</script>

<style scoped>
.visit-patient-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  border-inline-start: var(--border-width-3) solid var(--color-primary);
  align-items: center;
}
</style>
