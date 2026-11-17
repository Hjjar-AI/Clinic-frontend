<template>
  <CollectionPanel :title="kind === 'risk' ? 'تاريخ تقييم المخاطر المعتمد' : 'التسلسل الزمني للزيارات'" :resource-key="patientId" :read="read" v-slot="{ items }">
    <article v-for="row in items" :key="row.visit_id || row.id" class="border-bottom p-2">
      <BaseButton variant="ghost" :to="{ name: 'VisitDetail', params: { id: row.visit_id || row.id } }">
        <DateCell :date="row.visit_date" :relative="false" />
      </BaseButton>
      <template v-if="kind === 'risk'">
        <p>خطر الانتحار: <Badge status-type="risk" :status="row.suicide_risk_level" /></p>
        <p>خطر العنف: <Badge status-type="risk" :status="row.violence_risk_level" /></p>
        <p>الوصول إلى سلاح: {{ row.firearm_access == null ? 'غير معروف' : row.firearm_access ? 'نعم' : 'لا' }}</p>
      </template>
      <template v-else>
        <p>{{ row.approval === 'approved' ? 'نسخة معتمدة محفوظة' : 'بيانات عمل غير معتمدة' }} <span v-if="row.status === 'amended'">· يوجد تعديل قيد العمل</span></p>
        <p>{{ row.main_complaints || 'غير مسجل' }}</p>
      </template>
      <p v-if="row.revision_number">النسخة {{ row.revision_number }} · <DateCell :date="row.signed_at" :relative="false" show-time /></p>
    </article>
  </CollectionPanel>
</template>
<script setup>
import CollectionPanel from '@/components/common/CollectionPanel.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DateCell from '@/components/ui/DateCell.vue'
import Badge from '@/components/ui/Badge.vue'
import patientService from '@/features/patients/services/patientService'
const props = defineProps({ patientId: { type: Number, required: true }, kind: { type: String, required: true } })
const read = (id, offset) => props.kind === 'risk' ? patientService.riskHistory(id, offset) : patientService.timeline(id, offset)
</script>
