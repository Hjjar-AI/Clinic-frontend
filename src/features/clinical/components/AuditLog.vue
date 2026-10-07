<template>
  <VerticalEventList
    :columns="columns"
    :items="entries"
  >
    <template #timestamp="{ item }">
      <RelativeDate :date="item.timestamp" />
    </template>
    <template #user="{ item }">
      {{ item.user }}
    </template>
    <template #action="{ item }">
      <span :class="['badge-action', `action-${item.actionType}`]">
        {{ item.action }}
      </span>
    </template>
    <template #ip="{ item }">
      <span class="font-mono">{{ item.ip }}</span>
    </template>
  </VerticalEventList>
</template>

<script setup>
import RelativeDate from '@/components/ui/RelativeDate.vue'

import VerticalEventList from './VerticalEventList.vue'

defineProps({ entries: { type: Array, required: true } })

const columns = [
  { key: 'timestamp', label: 'التوقيت', class: 'numeric text-muted' },
  { key: 'user',      label: 'المستخدم' },
  { key: 'action',    label: 'الإجراء', class: 'audit-log__cell--action' },
  { key: 'ip',        label: 'IP',       class: 'numeric text-muted font-mono' },
]
</script>