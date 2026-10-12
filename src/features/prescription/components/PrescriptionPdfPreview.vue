<template>
  <section v-if="url" class="prescription-pdf-preview" :aria-label="title">
    <h3>{{ title }}</h3>
    <p>راجع الصفحات، ثم اطبع بالحجم الفعلي (100%) وبنفس أبعاد الورق.</p>
    <div class="preview-actions flex gap-2 mb-3">
      <BaseButton variant="primary" :disabled="!ready" @click="printPdf">طباعة {{ calibration ? 'ورقة المعايرة' : 'الوصفة' }}</BaseButton>
      <BaseButton :href="url" :download="filename">تنزيل {{ calibration ? 'ورقة المعايرة' : 'الوصفة' }}</BaseButton>
      <BaseButton :href="url">فتح PDF في نافذة جديدة</BaseButton>
    </div>
    <p v-if="printFallback" role="status">تعذر فتح الطباعة داخل الصفحة؛ افتح PDF في نافذة جديدة واستخدم أمر الطباعة في عارض الملف.</p>
    <iframe :key="url" ref="viewer" :src="url" :title="title" @load="ready = true" />
    <p class="text-muted text-sm">إذا لم تظهر المعاينة في متصفحك، افتح الملف في نافذة جديدة أو نزّله.</p>
  </section>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
const props = defineProps({ url: { type: String, required: true }, filename: { type: String, required: true }, calibration: Boolean })
const viewer = ref(null)
const ready = ref(false)
const printFallback = ref(false)
const title = computed(() => props.calibration ? 'معاينة ورقة المعايرة' : 'معاينة ملف الوصفة المعتمد')
watch(() => props.url, () => { ready.value = false; printFallback.value = false })
function printPdf() {
  try {
    const frame = viewer.value?.contentWindow
    if (!frame || typeof frame.print !== 'function') throw new Error('PDF viewer unavailable')
    frame.focus()
    frame.print()
  } catch { printFallback.value = true }
}
</script>
<style scoped src="../../../styles/features/prescription/components/prescription-pdf-preview.css"></style>
