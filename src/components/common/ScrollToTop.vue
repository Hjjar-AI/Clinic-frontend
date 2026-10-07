<!-- frontend/src/components/common/ScrollToTop.vue -->
<template>
  <button
    v-show="visible"
    class="btn btn--icon scroll-top-btn"
    :class="{ visible }"
    aria-label="الرجوع إلى الأعلى"
    @click="scrollToTop"
  >
    <Icon icon="chevron-up" />
  </button>
</template>

<script setup>
import { onBeforeUnmount,onMounted, ref } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const visible = ref(false)
const check = () => visible.value = window.scrollY > 200
onMounted(() => window.addEventListener('scroll', check, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', check))
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>