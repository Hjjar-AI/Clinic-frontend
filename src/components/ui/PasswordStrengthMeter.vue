<template>
  <div
    v-if="password.length"
    class="password-strength"
  >
    <div class="strength-bar">
      <div
        class="strength-fill"
        :class="strengthClass"
        :style="{ width: strengthScore.percent + '%' }"
      />
    </div>
    <span class="strength-label">{{ strengthScore.label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { getPasswordStrength } from '@/utils/validators'

const props = defineProps({
  password: { type: String, default: '' },
  username: { type: String, default: '' }   // optional for similarity check
})

const strengthScore = computed(() => {
  return getPasswordStrength(props.password, props.username)
})

const strengthClass = computed(() => {
  const score = strengthScore.value.score
  if (score <= 1) return 'weak'
  if (score <= 3) return 'medium'
  return 'strong'
})
</script>