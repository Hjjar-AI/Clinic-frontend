<template>
  <Tooltip position="top">
    <template #trigger>
      <router-link
        :to="`/patients/${id}`"
        class="patient-link"
        :class="{ 'patient-link--highlight': highlight }"
      >
        {{ fullName({ first_name: firstName, surname }) }}
      </router-link>
    </template>
    <div>
      <span v-if="phone">📞 {{ formatPhone(phone) }}</span>
      <span v-if="lastVisit"> | 📅 آخر زيارة: {{ lastVisit }}</span>
      <span v-if="importantNotes"> | 📝 {{ importantNotes }}</span>
    </div>
  </Tooltip>
</template>

<script setup>
import Tooltip from '@/components/ui/Tooltip.vue'
import { useFormatters } from '@/composables/useFormatters'
import { fullName } from '@/utils/normalize'

defineProps({
  id: { type: [Number, String], required: true },
  firstName: { type: String, default: '' },
  surname: { type: String, default: '' },
  phone: { type: String, default: '' },
  lastVisit: { type: String, default: '' },
  importantNotes: { type: String, default: '' },
  highlight: { type: Boolean, default: false },
})

const { formatPhone } = useFormatters()
</script>
