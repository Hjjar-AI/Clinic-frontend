<template>
  <Tooltip :position="'top'">
    <template #trigger>
      <div
        class="appointment-block"
        :class="`appointment-block--${appointment.status}`"
        :draggable="canManage"
        :role="canManage ? 'button' : undefined"
        :tabindex="canManage ? 0 : undefined"
        @dragstart="onDragStart"
        @click="canManage && $emit('edit', appointment)"
        @keydown.enter="canManage && $emit('edit', appointment)"
      >
        <strong>{{ appointment.time }}</strong> {{ appointment.patient_name }}
        <span class="duration">({{ appointment.duration_minutes || 30 }}د)</span>
      </div>
    </template>
    {{ blockTitle }}
  </Tooltip>
</template>

<script setup>
import { computed } from 'vue'

import Tooltip from '@/components/ui/Tooltip.vue'

const props = defineProps({
  appointment: { type: Object, default: () => ({}) },
  canManage: { type: Boolean, default: false },
})

defineEmits(['edit'])

const blockTitle = computed(
  () => `${props.appointment.patient_name} – ${props.appointment.time} – ${props.appointment.duration_minutes || 30} دقيقة`
)

function onDragStart(e) {
  if (!props.canManage) {
    e.preventDefault()
    return
  }
  e.dataTransfer.setData('text/plain', JSON.stringify({
    id: props.appointment.id,
    appointment_date: props.appointment.appointment_date,
    appointment_time: props.appointment.appointment_time
  }))
  e.dataTransfer.effectAllowed = 'move'
}
</script>
