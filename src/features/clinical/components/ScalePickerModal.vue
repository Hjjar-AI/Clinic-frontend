<template>
  <BaseModal
    :model-value="modelValue"
    title="اختر مقياساً"
    size="sm"
    @update:model-value="$emit('close')"
  >
    <ResourceFeedback
      :loading="loading"
      :error="error"
      retryable
      @retry="load"
    />
    <ul
      v-if="!loading && !error && scales.length"
      class="list-unstyled"
    >
      <li
        v-for="s in scales"
        :key="s.id"
        class="mb-2"
      >
        <button
          class="btn btn--ghost btn--block"
          @click="select(s)"
        >
          {{ s.name }}
        </button>
      </li>
    </ul>
    <p
      v-else-if="!loading && !error"
      class="text-muted text-center"
    >
      لا توجد مقاييس متاحة
    </p>
  </BaseModal>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import BaseModal from '@/components/ui/BaseModal.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { useLatestResource } from '@/composables/useLatestResource'
import { useScaleLookup } from '@/features/clinical/stores/scaleLookup'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['select', 'close'])
const catalog = useScaleLookup()
const { items: scales } = storeToRefs(catalog)
const { loading, error, load } = useLatestResource(
  () => props.modelValue,
  (open) => (open ? catalog.fetch() : null),
  'تعذر تحميل المقاييس',
)
function select(scale) {
  emit('select', scale)
}
</script>
