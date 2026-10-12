<template>
  <fieldset class="prescription-paper-options" :disabled="disabled">
    <legend>ورق الطباعة</legend>
    <div class="grid-2 gap-3">
      <FormSelect :model-value="model.mode" label="نوع الورق" :options="paperModes" @update:model-value="update('mode', $event)" />
      <FormSelect v-model="preset" label="حجم الورق" :options="paperPresets" @update:model-value="applyPreset" />
      <template v-if="preset === 'custom'">
        <FormInput :model-value="model.width_mm" type="number" label="عرض الورقة (مم)" :min="80" :max="216" :step="0.1" @update:model-value="update('width_mm', $event)" />
        <FormInput :model-value="model.height_mm" type="number" label="ارتفاع الورقة (مم)" :min="120" :max="350" :step="0.1" @update:model-value="update('height_mm', $event)" />
      </template>
      <template v-if="model.mode === 'preprinted'">
        <FormInput :model-value="model.offset_x_mm" type="number" label="إزاحة أفقية (مم؛ الموجب إلى اليمين)" :min="-5" :max="5" :step="0.5" @update:model-value="update('offset_x_mm', $event)" />
        <FormInput :model-value="model.offset_y_mm" type="number" label="إزاحة عمودية (مم؛ الموجب إلى الأسفل)" :min="-5" :max="5" :step="0.5" @update:model-value="update('offset_y_mm', $event)" />
      </template>
    </div>
    <ResourceFeedback :error="normalized ? '' : 'تحقق من أبعاد الورق والإزاحة قبل إنشاء الوصفة'" />
    <p>الحجم الافتراضي A6. الإعدادات خاصة بهذا الحساب والمتصفح. أبعاد الصورة وحدها لا تؤكد حجم الورقة؛ أدخل أبعاد ورقك الفعلية عند الحاجة.</p>
    <p>اطبع ملف PDF بالحجم الفعلي (100%)، واختر نفس حجم الورق في الطابعة دون ملاءمة تلقائية.</p>
    <template v-if="model.mode === 'preprinted' && normalized">
      <p>تُطبع البيانات فقط؛ الشعار والحدود والرقم الموجود في الصورة لا تدخل ملف PDF. استخدم ورقة تجريبية لضبط المحاذاة. قد تتوزع الوصفة على عدة أوراق.</p>
      <div class="prescription-paper-guide" :style="{ aspectRatio: `${normalized.width_mm} / ${normalized.height_mm}` }">
        <img src="/static/prescription-paper-reference.jpeg" alt="مرجع لمحاذاة البيانات على الورق المطبوع" />
        <span class="paper-marker" :style="position(.475, .202)">{{ snapshot?.patient_name || 'اسم المريض' }}</span>
        <span class="paper-marker" :style="position(.07, .202)">{{ snapshot?.patient_age ?? 'العمر' }}</span>
        <span class="paper-marker" :style="position(.475, .226)">{{ snapshot?.patient_national_id || 'رقم الهوية' }}</span>
        <span class="paper-marker" :style="position(.07, .226)">{{ snapshot?.patient_address || 'العنوان' }}</span>
      </div>
      <p class="text-muted text-sm">الصورة دليل محاذاة فقط؛ راجع ملف PDF المولد للحجم والمحتوى الفعليين.</p>
    </template>
  </fieldset>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import ResourceFeedback from '@/components/ui/ResourceFeedback.vue'
import { normalizePaperOptions, paperPresets, paperPreset } from '@/features/prescription/services/prescriptionPaper'

defineProps({ disabled: Boolean, snapshot: { type: Object, default: null } })
const model = defineModel({ type: Object, required: true })
const emit = defineEmits(['validity'])
const preset = ref(paperPreset(model.value))
const paperModes = [{ value: 'blank', label: 'ورق فارغ — طباعة الوصفة كاملة' }, { value: 'preprinted', label: 'ورق مطبوع مثل النموذج — البيانات فقط' }]
const normalized = computed(() => normalizePaperOptions(model.value))
watch(normalized, value => emit('validity', Boolean(value)), { immediate: true })
function update(key, value) { model.value = { ...model.value, [key]: value } }
function applyPreset(value) {
  if (value !== 'custom') model.value = { ...model.value, width_mm: value === 'a4' ? 210 : 105, height_mm: value === 'a4' ? 297 : 148 }
}
function position(x, y) {
  const paper = normalized.value
  return { left: `${(x + paper.offset_x_mm / paper.width_mm) * 100}%`, top: `${(y + paper.offset_y_mm / paper.height_mm) * 100}%` }
}
</script>
<style scoped src="../../../styles/features/prescription/components/prescription-paper-options.css"></style>
