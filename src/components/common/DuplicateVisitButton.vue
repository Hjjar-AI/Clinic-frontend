<template>
  <BaseButton
    variant="secondary"
    size="sm"
    @click="duplicate"
  >
    <Icon icon="copy" /> {{ label }}
  </BaseButton>
</template>

<script setup>
import { useRouter } from 'vue-router'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  visitId: { type: [Number, String], required: true },
  patientId: { type: [Number, String], required: true },
  label: { type: String, default: 'نسخ الزيارة' }
})

const router = useRouter()
function duplicate() {
  router.push({
    name: 'VisitCreate',
    params: { patientId: props.patientId },
    query: { duplicateFrom: props.visitId },
  })
}
</script>
