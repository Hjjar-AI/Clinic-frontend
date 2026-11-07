<!-- frontend/src/views/TermsView.vue -->
<template>
  <PageHeader title="شروط الخدمة" />
  <BaseCard>
    <div class="card__body prose">
      <p>آخر تحديث: ١ يوليو ٢٠٢٦</p>
      <h2 class="heading-3">
        قبول الشروط
      </h2>
      <p>باستخدامك لهذا النظام، فإنك توافق على الالتزام بسياسات العيادة الداخلية والتعليمات التنظيمية. النظام مخصص للاستخدام الداخلي فقط.</p>
      <h2 class="heading-3">
        مسؤوليات المستخدم
      </h2>
      <p>يمنع نسخ أو توزيع أي بيانات دون إذن مسبق. المستخدم مسؤول عن الحفاظ على سرية بيانات الدخول.</p>
    </div>
  </BaseCard>
</template>

<script setup>
import PageHeader from '@/components/ui/PageHeader.vue'
</script>