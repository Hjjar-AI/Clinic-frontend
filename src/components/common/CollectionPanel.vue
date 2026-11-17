<template>
  <section class="mb-3" :aria-label="title">
    <h3>{{ title }}</h3>
    <slot name="actions" />
    <ResourceFeedback :loading="loading" :error="error" retryable @retry="retry" />
    <slot v-if="!loading && !error" :items="data?.items || []" :meta="data?.meta || {}" />
    <p v-if="!loading && !error && !data?.items?.length">لا توجد سجلات.</p>
    <div v-if="data?.meta?.pagination === 'offset'" class="flex gap-2 mt-3">
      <BaseButton :disabled="loading || offset === 0" @click="offset = Math.max(0, offset - pageSize)">السابق</BaseButton>
      <BaseButton :disabled="loading || !hasMore" @click="offset += pageSize">التالي</BaseButton>
    </div>
  </section>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useLatestResource } from '@/composables/useLatestResource'
const props = defineProps({ title: { type: String, required: true }, resourceKey: { type: [String, Number], required: true }, read: { type: Function, required: true } })
const offset = ref(0)
watch(() => props.resourceKey, () => { offset.value = 0 })
const { data, loading, error, retry } = useLatestResource(
  () => JSON.stringify([props.resourceKey, offset.value]),
  key => { const [id, start] = JSON.parse(key); return props.read(id, start) },
)
const pageSize = computed(() => data.value?.meta?.per_page || 20)
const hasMore = computed(() => data.value?.meta?.has_more ?? (offset.value + (data.value?.items?.length || 0) < (data.value?.meta?.total || 0)))
defineExpose({ reload: retry })
</script>
