<template>
  <nav class="visit-section-navigator" aria-label="أقسام توثيق الزيارة">
    <button v-for="section in sections" :key="section.id" type="button" class="btn btn--secondary btn--sm" @click="jump(section.id)">{{ section.label }} <span v-if="section.missing"> · غير مسجل</span></button>
  </nav>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ form: { type: Object, required: true } })
const sections = computed(() => [
  { id: 'visit-history', label: 'القصة', missing: !props.form.main_complaints?.trim() },
  { id: 'visit-examination', label: 'الفحص', missing: !props.form.mse?.trim() },
  { id: 'visit-diagnoses', label: 'التشخيصات والتحاليل', missing: false },
  { id: 'visit-plan', label: 'الأدوية والخطة', missing: !props.form.treatment_text?.trim() && !props.form.medications?.length },
  { id: 'visit-administration', label: 'التوثيق والتعليمات', missing: false },
])
function jump(id) {
  const target = document.getElementById(id)
  if (!target) return
  const toggle = target.querySelector('button[aria-expanded="false"]')
  if (toggle) toggle.click()
  target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  target.focus({ preventScroll: true })
}
</script>
