<template>
  <BaseModal
    :model-value="modelValue"
    title="اختصارات لوحة المفاتيح"
    size="md"
    @update:model-value="$emit('update:modelValue', false)"
  >
    <table class="table table--striped">
      <thead><tr><th>الاختصار</th><th>الوظيفة</th></tr></thead>
      <tbody>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">D</kbd></td><td>لوحة التحكم</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">P</kbd></td><td>قائمة المرضى</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">N</kbd></td><td>مريض جديد</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">C</kbd></td><td>تقويم المواعيد</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">A</kbd></td><td>موعد جديد</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">T</kbd></td><td>المهام</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">R</kbd></td><td>الإحصائيات</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">S</kbd></td><td>الإعدادات</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">Q</kbd></td><td>نافذة الإضافة السريعة</td></tr>
        <tr><td><kbd class="kbd">Alt</kbd> + <kbd class="kbd">K</kbd></td><td>اختصارات لوحة المفاتيح</td></tr>
        <tr><td><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">S</kbd></td><td>حفظ النموذج الحالي</td></tr>
        <tr><td><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">F</kbd></td><td>البحث عن مريض</td></tr>
        <tr><td><kbd class="kbd">Esc</kbd></td><td>إغلاق النوافذ المنبثقة</td></tr>
      </tbody>
    </table>
    <p class="text-xs text-muted mt-3 text-center">
      اضغط <kbd class="kbd">Alt</kbd> + <kbd class="kbd">K</kbd> في أي وقت لفتح هذه النافذة.
    </p>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
defineProps({ modelValue: Boolean })
defineEmits(['update:modelValue'])
</script>