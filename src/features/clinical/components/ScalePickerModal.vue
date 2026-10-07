<template>
  <BaseModal
    :model-value="modelValue"
    title="اختر مقياساً"
    size="sm"
    @update:model-value="$emit('close')"
  >
    <ul
      v-if="scales.length"
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
      v-else
      class="text-muted text-center"
    >
      لا توجد مقاييس متاحة
    </p>
  </BaseModal>
</template>

<script setup>
import { onMounted,ref } from 'vue'

import BaseModal from '@/components/ui/BaseModal.vue'
import { useScaleStore } from '@/features/clinical/stores/scales'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['select', 'close'])

const scaleStore = useScaleStore()
const scales = ref([])

onMounted(async () => {
  await scaleStore.fetchScales()
  scales.value = scaleStore.scales
})

function select(scale) { emit('select', scale) }
</script>