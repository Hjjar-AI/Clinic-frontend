<!-- frontend/src/views/ManualView.vue -->
<template>
  <PageHeader title="الدليل الشامل" />
  <BaseCard>
    <div class="card__body prose">
      <h2 class="heading-3 mb-3">
        مقدمة
      </h2>
      <p class="text-muted mb-2">
        يجري حالياً إعداد الدليل التفصيلي. سيتوفر قريباً.
      </p>
      <p>لأي استفسار، يرجى الاتصال بإدارة العيادة.</p>
      <h2 class="heading-3 mb-3">
        الدعم الفني
      </h2>
      <p>إذا واجهت أي مشكلة، يرجى التواصل مع فريق الدعم الفني على البريد الإلكتروني أو الهاتف المدرج في صفحة الإعدادات.</p>
    </div>
  </BaseCard>
</template>

<script setup>
import PageHeader from '@/components/ui/PageHeader.vue'
</script>

<style scoped src="../../../styles/features/reports/views/manual-view.css"></style>
