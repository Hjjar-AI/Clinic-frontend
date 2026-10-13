<template>
  <section aria-label="تفضيلات مساحة العمل">
    <h2 class="heading-5">مساحة العمل على هذا الجهاز</h2>
    <FormSelect :model-value="workspace.preferences.density" label="كثافة القوائم" :options="[{ value: 'comfortable', label: 'مريحة' }, { value: 'compact', label: 'مدمجة' }]" @update:model-value="workspace.update({ density: $event })" />
    <FormCheckbox :model-value="workspace.preferences.splitView" :disabled="!auth.can('view_visits') || !auth.can('export_pdf')" label="عرض مرجع معتمد بجانب محرر الزيارة" @update:model-value="workspace.update({ splitView: $event })" />
    <FormCheckbox :model-value="workspace.preferences.progressive" label="إظهار التفاصيل الاختيارية عند الطلب" @update:model-value="workspace.update({ progressive: $event })" />
    <p>تُحفظ تفضيلات العرض لهذا الحساب والمتصفح. حقول المخاطر والبيانات المطلوبة تبقى متاحة دائماً.</p>
  </section>
</template>
<script setup>
import FormSelect from '@/components/ui/FormSelect.vue'
import FormCheckbox from '@/components/ui/FormCheckbox.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/features/auth/stores/auth'
const workspace = useWorkspaceStore()
const auth = useAuthStore()
</script>
