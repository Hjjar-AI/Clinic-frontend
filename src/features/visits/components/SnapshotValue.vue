<template>
  <ul v-if="Array.isArray(value)">
    <li v-for="(item, index) in value" :key="index"><SnapshotValue :value="item" :depth="depth + 1" /></li>
  </ul>
  <dl v-else-if="value && typeof value === 'object' && depth < 20" class="snapshot-fields">
    <template v-for="(item, key) in value" :key="key">
      <dt>{{ labels[key] || key }}</dt><dd><SnapshotValue :value="item" :depth="depth + 1" /></dd>
    </template>
  </dl>
  <span v-else>{{ formatDisplayValue(value) }}</span>
</template>
<script setup>
import { formatDisplayValue } from '@/utils/formatters'
defineProps({ value: { default: null }, depth: { type: Number, default: 0 } })
const labels = { patient: 'المريض', clinician: 'الطبيب', fields: 'بيانات الزيارة', visit_date: 'تاريخ الزيارة', main_complaints: 'الشكوى الرئيسية', history_presenting_complaint: 'القصة الحالية', treatment_text: 'الخطة العلاجية', doctor_notes: 'ملاحظات الطبيب', clinical_data: 'البيانات السريرية', diagnoses: 'التشخيصات', medications: 'الأدوية', lab_values: 'الفحوصات', scale_responses: 'المقاييس', attachments: 'المرفقات', follow_up: 'المتابعة', longitudinal: 'السجلات المستمرة', suicide_risk_level: 'خطر الانتحار', violence_risk_level: 'خطر العنف', firearm_access: 'الوصول إلى سلاح', full_name: 'الاسم', patient_number: 'رقم الملف' }
</script>
<style scoped src="../../../styles/features/visits/components/snapshot-value.css"></style>
