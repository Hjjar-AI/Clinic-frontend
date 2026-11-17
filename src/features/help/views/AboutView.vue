<!-- frontend/src/views/AboutView.vue -->
<template>
  <PageHeader title="حول النظام" />
  <BaseCard>
    <div class="card__body prose">
      <p>نظام إدارة العيادة النفسية <span v-if="version">– إصدار {{ version }}</span></p>
      <ResourceFeedback :error="error" retryable @retry="retry" />
    </div>
  </BaseCard>
</template>

<script setup>
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useAppVersion } from '@/composables/useAppVersion'
const { version, error, retry } = useAppVersion()
import PageHeader from '@/components/ui/PageHeader.vue'
</script>
