<template>
  <BaseModal v-if="mobile" :model-value="modelValue" :title="title" size="xl" panel @update:model-value="$emit('update:modelValue', $event)"><slot /></BaseModal>
  <aside v-else-if="modelValue" class="workspace-detail-panel" :aria-label="title">
    <div class="flex flex--wrap gap-2"><h2 class="heading-5">{{ title }}</h2><BaseButton size="sm" aria-label="إغلاق التفاصيل" @click="$emit('update:modelValue', false)">إغلاق</BaseButton></div><slot />
  </aside>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
defineProps({ modelValue: Boolean, title: { type: String, required: true } })
defineEmits(['update:modelValue'])
const query = window.matchMedia('(max-width: 768px)')
const mobile = ref(query.matches)
const changed = event => { mobile.value = event.matches }
onMounted(() => query.addEventListener('change', changed))
onBeforeUnmount(() => query.removeEventListener('change', changed))
</script>
