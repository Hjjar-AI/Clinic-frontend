<!-- frontend/src/features/clinical/components/LetterSheet.vue -->
<template>
  <BaseCard class="letter-sheet">
    <template #header>
      <div class="letter-sheet__header">
        <h3 class="letter-sheet__clinic">
          {{ clinicName }}
        </h3>
        <div class="letter-sheet__meta">
          <span
            v-if="date"
            class="numeric"
          >التاريخ: {{ date }}</span>
        </div>
      </div>
    </template>
    <div class="letter-sheet__body">
      <slot />
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'

defineProps({
  clinicName: { type: String, default: '' },
  date: { type: String, default: '' }
})
</script>