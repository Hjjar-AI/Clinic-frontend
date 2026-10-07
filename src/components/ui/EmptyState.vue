<template>
  <div
    class="empty-state"
    :class="[`empty-state--${type}`, { 'empty-state--small': small }]"
  >
    <div class="empty-state__illustration">
      <Icon
        :icon="computedIcon"
        class="empty-state__icon"
      />
    </div>
    <h2 class="empty-state__title">
      {{ displayTitle }}
    </h2>
    <p
      v-if="displayDescription"
      class="empty-state__description"
    >
      {{ displayDescription }}
    </p>
    <div
      v-if="actionUrl || $slots.actions"
      class="empty-state__actions"
    >
      <slot name="actions">
        <BaseButton
          v-if="actionUrl"
          variant="primary"
          size="sm"
          :to="actionUrl"
        >
          <Icon icon="plus" /> {{ actionText }}
        </BaseButton>
      </slot>
    </div>
    <div
      v-if="tip"
      class="empty-state__tip"
    >
      <Icon icon="lightbulb" />
      <span>{{ tip }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import Icon from '@/components/ui/Icon.vue'

const ENTITY_DEFAULTS = {
  patients:   { icon: 'users',            title: 'لا يوجد مرضى',              description: 'قم بإضافة مريض جديد لبدء السجل الطبي.' },
  visits:     { icon: 'notes-medical',    title: 'لا توجد زيارات',            description: 'لم تُسجَّل أي زيارة لهذا المريض بعد.' },
  appointments:{ icon: 'calendar-alt',    title: 'لا توجد مواعيد',            description: 'لا توجد مواعيد مجدولة حالياً.' },
  tasks:      { icon: 'tasks',            title: 'لا توجد مهام',              description: 'جميع المهام مكتملة أو لم تُضف بعد.' },
  invoices:   { icon: 'file-invoice',     title: 'لا توجد فواتير',            description: 'لم تُنشأ أي فاتورة بعد.' },
  templates:  { icon: 'file-alt',         title: 'لا توجد قوالب',             description: 'يمكنك إنشاء قالب جديد لبدء العمل.' },
  users:      { icon: 'user-cog',         title: 'لا يوجد مستخدمين',          description: 'قم بإضافة مستخدم جديد للبدء.' },
  medications:{ icon: 'pills',            title: 'لا توجد أدوية',             description: 'لم تُضف أي أدوية بعد.' },
  diagnoses:  { icon: 'diagnoses',        title: 'لا توجد تشخيصات',           description: 'لم تُضف أي تشخيصات بعد.' },
  scales:     { icon: 'chart-line',       title: 'لا توجد مقاييس',            description: 'لم تُنشأ أي مقاييس سريرية بعد.' },
  charts:     { icon: 'chart-pie',        title: 'لا توجد بيانات كافية',       description: 'لم يتم العثور على بيانات للرسم البياني.' },
  search:     { icon: 'search',           title: 'لا توجد نتائج',             description: 'حاول تعديل كلمات البحث أو عوامل التصفية.' },
  default:    { icon: 'inbox',            title: 'لا توجد بيانات',            description: 'قم بإضافة سجلات جديدة لتظهر هنا.' },
}

const props = defineProps({
  type: { type: String, default: 'default' },
  title: String,
  description: String,
  actionText: String,
  actionUrl: String,
  icon: String,
  tip: String,
  small: Boolean,
})

const defaultConfig = computed(() => ENTITY_DEFAULTS[props.type] || ENTITY_DEFAULTS.default)
const computedIcon = computed(() => props.icon || defaultConfig.value.icon)
const displayTitle = computed(() => props.title || defaultConfig.value.title)
const displayDescription = computed(() => {
  if (props.description !== undefined) return props.description
  return defaultConfig.value.description
})
</script>
