<template>
  <section
    v-if="url"
    class="pdf-preview"
    :aria-label="documentTitle"
  >
    <h3>{{ documentTitle }}</h3>
    <p>{{ printHint }}</p>
    <div class="preview-actions flex gap-2 mb-3">
      <BaseButton
        variant="primary"
        @click="printPdf"
      >
        طباعة {{ documentLabel }}
      </BaseButton>
      <BaseButton
        :href="url"
        :download="filename"
      >
        تنزيل {{ documentLabel }}
      </BaseButton>
      <BaseButton :href="url">
        فتح PDF في نافذة جديدة
      </BaseButton>
    </div>
    <p
      v-if="printFallback"
      role="status"
    >
      تستخدم الطباعة عارض PDF في نافذة جديدة. إذا لم يظهر مربع الطباعة، استخدم
      أمر الطباعة في العارض. إذا حظر المتصفح النافذة، افتح الملف بالرابط أعلاه.
    </p>
    <iframe
      :key="url"
      ref="viewer"
      :src="url"
      :title="documentTitle"
      @load="ready = true"
    />
    <p class="text-muted text-sm">
      إذا لم تظهر المعاينة في متصفحك، افتح الملف في نافذة جديدة أو نزّله.
    </p>
  </section>
</template>
<script setup>
import { ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
const props = defineProps({
  url: { type: String, required: true },
  filename: { type: String, required: true },
  documentTitle: { type: String, required: true },
  documentLabel: { type: String, required: true },
  printHint: {
    type: String,
    default: 'راجع الصفحات، ثم اطبع بالحجم الفعلي (100%) وبنفس أبعاد الورق.',
  },
})
const viewer = ref(null)
const ready = ref(false)
const printFallback = ref(false)
watch(
  () => props.url,
  () => {
    ready.value = false
    printFallback.value = false
  },
)
function printPdf() {
  printFallback.value = false
  try {
    const frame = viewer.value?.contentWindow
    if (!ready.value || !frame || typeof frame.print !== 'function')
      throw new Error('PDF viewer unavailable')
    frame.focus()
    frame.print()
  } catch {
    printFallback.value = true
    try {
      const popup = window.open(props.url, '_blank')
      if (!popup) return
      popup.opener = null
      popup.addEventListener(
        'load',
        () => {
          try {
            popup.focus()
            popup.print()
          } catch {
            /* Native viewer controls remain available. */
          }
        },
        { once: true },
      )
    } catch {
      /* The explicit Open/Download links remain available. */
    }
  }
}
</script>
<style scoped src="../../styles/components/documents/pdf-preview.css"></style>
