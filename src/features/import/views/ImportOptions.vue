<template>
  <div class="import-options-view">
    <PageHeader
      title="استيراد البيانات"
      subtitle="استيراد محتوى التشخيصات وأسماء الأدوية وجرعاتها؛ حالة التفعيل وتصنيف الأدوية المراقبة لا يُستعادان من الملف. الاستعادة الكاملة متاحة عبر النسخ الاحتياطي."
    />
    <div class="grid-2 mb-3">
      <DiagnosisImportPanel />
      <MedicationImportPanel />
    </div>
  </div>
</template>
<script setup>
import PageHeader from '@/components/ui/PageHeader.vue'
import DiagnosisImportPanel from '@/features/import/components/DiagnosisImportPanel.vue'
import MedicationImportPanel from '@/features/import/components/MedicationImportPanel.vue'
</script>
