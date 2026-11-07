<template>
  <section aria-label="التفضيلات وتوثيق الملف">
    <h3 class="heading-5 mt-4">التفضيلات وتوثيق المعلومات</h3>
    <div class="grid-2">
      <FormField label="توثيق الهوية">
        <select v-model="form.identity_verification" class="form-control">
          <option value="unknown">غير معروف</option><option value="reported">معلومات مبلّغة</option>
          <option v-if="canVerify || form.identity_verification==='verified'" value="verified" :disabled="!canVerify">تم التحقق من المستند</option>
        </select>
      </FormField>
      <FormField label="اللغة المفضلة"><input v-model="form.preferred_language" class="form-control" maxlength="30"></FormField>
      <FormField label="طريقة التواصل المفضلة"><select v-model="form.preferred_contact_channel" class="form-control"><option value="">غير محدد</option><option value="phone">هاتف</option><option value="sms">رسالة نصية</option><option value="email">بريد إلكتروني</option><option value="none">عدم التواصل</option></select></FormField>
      <FormField label="قيود التواصل"><textarea v-model="form.communication_restrictions" class="form-control" rows="2" /></FormField>
      <template v-if="auth.can('edit_visit')">
        <FormField label="معلومات الحساسية"><select v-model="form.allergy_status" class="form-control"><option value="unknown">غير معروف</option><option value="none_known">لا توجد حساسية معروفة وفق المعلومات الحالية</option><option value="recorded">توجد معلومات مسجلة</option></select></FormField>
        <FormField label="الأدوية المستمرة"><select v-model="form.medication_status" class="form-control"><option value="unknown">غير معروف</option><option value="none_known">لا توجد أدوية مستمرة وفق المعلومات الحالية</option><option value="recorded">توجد معلومات مسجلة</option></select></FormField>
      </template>
      <FormField v-if="isEdit" label="سبب تصحيح بيانات الملف" required><input v-model="form.correction_reason" class="form-control" maxlength="500" required></FormField>
    </div>
    <p class="text-muted">السنة تكفي لتاريخ الميلاد، والبيانات الموصى باستكمالها لا تمنع حفظ ملف صحيح. أضف جهات الاتصال والوثائق والأوصياء والسجلات المستمرة من شاشة المريض.</p>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import FormField from '@/components/ui/FormField.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
defineProps({form:{type:Object,required:true},isEdit:Boolean})
const auth=useAuthStore()
const canVerify=computed(()=>['admin','doctor'].includes(auth.user?.role))
</script>
