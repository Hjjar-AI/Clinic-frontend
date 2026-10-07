<template>
  <span
    class="tag"
    :class="computedClasses"
  >
    <Icon
      v-if="displayIcon"
      :icon="displayIcon"
      class="badge__icon"
      size="xs"
    />
    <span
      v-if="value !== null"
      class="badge__value"
    >{{ arabicValue }}</span>
    <slot>{{ displayLabel }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { useFormatters } from '@/composables/useFormatters'
import {
  APPOINTMENT_STATUS,
  INVOICE_STATUS,
  RISK_LEVELS,
  TASK_STATUS,
  VISIT_STATUS} from '@/constants/statusConstants'

const { formatNumber } = useFormatters()

const props = defineProps({
  color: { type: String, default: '' },
  variant: { type: String, default: 'soft' },
  size: { type: String, default: 'md' },
  status: { type: String, default: '' },
  statusType: { type: String, default: 'appointment' },
  label: { type: String, default: '' },
  value: { type: [Number, String], default: null },
  severity: { type: String, default: 'normal' },
  icon: { type: String, default: '' },
})

// ------------- Status maps (extended with 'visit') -------------
const statusColorMap = {
  appointment: {
    [APPOINTMENT_STATUS.SCHEDULED]: 'info',
    [APPOINTMENT_STATUS.CONFIRMED]: 'primary',
    [APPOINTMENT_STATUS.ARRIVED]: 'warning',
    [APPOINTMENT_STATUS.COMPLETED]: 'success',
    [APPOINTMENT_STATUS.CANCELLED]: 'danger',
    [APPOINTMENT_STATUS.NO_SHOW]: 'warning'
  },
  task: {
    [TASK_STATUS.OPEN]: 'warning',
    [TASK_STATUS.IN_PROGRESS]: 'info',
    [TASK_STATUS.COMPLETED]: 'success',
    [TASK_STATUS.CANCELLED]: 'danger'
  },
  invoice: {
    [INVOICE_STATUS.DRAFT]: 'grey',
    [INVOICE_STATUS.ISSUED]: 'info',
    [INVOICE_STATUS.PAID]: 'success',
    [INVOICE_STATUS.CANCELLED]: 'danger',
    overdue: 'warning'
  },
  scale: { published: 'success', draft: 'warning' },
  user: { admin: 'purple', doctor: 'primary', receptionist: 'info' },
  medication: { controlled: 'danger', active: 'success', discontinued: 'grey' },
  risk: {
    [RISK_LEVELS.HIGH]: 'danger',
    [RISK_LEVELS.MODERATE]: 'warning',
    [RISK_LEVELS.LOW]: 'success',
    null: 'grey'
  },
  visit: {
    [VISIT_STATUS.DRAFT]: 'grey',
    [VISIT_STATUS.FINAL]: 'success',
    [VISIT_STATUS.AMENDED]: 'warning',
    [VISIT_STATUS.LOCKED]: 'danger'
  }
}

const statusIconMap = {
  appointment: {
    [APPOINTMENT_STATUS.SCHEDULED]: 'calendar-check',
    [APPOINTMENT_STATUS.CONFIRMED]: 'check',
    [APPOINTMENT_STATUS.ARRIVED]: 'user-check',
    [APPOINTMENT_STATUS.COMPLETED]: 'check-circle',
    [APPOINTMENT_STATUS.CANCELLED]: 'times-circle',
    [APPOINTMENT_STATUS.NO_SHOW]: 'exclamation-circle'
  },
  task: {
    [TASK_STATUS.OPEN]: 'circle',
    [TASK_STATUS.IN_PROGRESS]: 'spinner',
    [TASK_STATUS.COMPLETED]: 'check-circle',
    [TASK_STATUS.CANCELLED]: 'ban'
  },
  invoice: {
    [INVOICE_STATUS.DRAFT]: 'file-alt',
    [INVOICE_STATUS.ISSUED]: 'file-invoice',
    [INVOICE_STATUS.PAID]: 'check-circle',
    [INVOICE_STATUS.CANCELLED]: 'times-circle',
    overdue: 'clock'
  },
  scale: { published: 'check-circle', draft: 'edit' },
  user: { admin: 'crown', doctor: 'user-md', receptionist: 'user-tie' },
  medication: { controlled: 'lock', active: 'check-circle', discontinued: 'minus-circle' },
  risk: {
    [RISK_LEVELS.HIGH]: 'exclamation-triangle',
    [RISK_LEVELS.MODERATE]: 'exclamation-circle',
    [RISK_LEVELS.LOW]: 'check-circle',
    null: 'minus-circle'
  },
  visit: {
    [VISIT_STATUS.DRAFT]: 'edit',
    [VISIT_STATUS.FINAL]: 'check-circle',
    [VISIT_STATUS.AMENDED]: 'history',
    [VISIT_STATUS.LOCKED]: 'lock'
  }
}

const statusLabelMap = {
  appointment: {
    [APPOINTMENT_STATUS.SCHEDULED]: 'مجدول',
    [APPOINTMENT_STATUS.CONFIRMED]: 'مؤكد',
    [APPOINTMENT_STATUS.ARRIVED]: 'وصل',
    [APPOINTMENT_STATUS.COMPLETED]: 'مكتمل',
    [APPOINTMENT_STATUS.CANCELLED]: 'ملغي',
    [APPOINTMENT_STATUS.NO_SHOW]: 'غائب'
  },
  task: {
    [TASK_STATUS.OPEN]: 'مفتوحة',
    [TASK_STATUS.IN_PROGRESS]: 'قيد التنفيذ',
    [TASK_STATUS.COMPLETED]: 'مكتمل',
    [TASK_STATUS.CANCELLED]: 'ملغي'
  },
  invoice: {
    [INVOICE_STATUS.DRAFT]: 'مسودة',
    [INVOICE_STATUS.ISSUED]: 'صادرة',
    [INVOICE_STATUS.PAID]: 'مدفوعة',
    [INVOICE_STATUS.CANCELLED]: 'ملغية',
    overdue: 'متأخرة'
  },
  scale: { published: 'منشور', draft: 'مسودة' },
  user: { admin: 'مدير', doctor: 'طبيب', receptionist: 'موظف استقبال' },
  medication: { controlled: 'مادة خاضعة للرقابة', active: 'نشط', discontinued: 'متوقف' },
  risk: {
    [RISK_LEVELS.HIGH]: 'مرتفع',
    [RISK_LEVELS.MODERATE]: 'متوسط',
    [RISK_LEVELS.LOW]: 'منخفض',
    null: 'غير محدد'
  },
  visit: {
    [VISIT_STATUS.DRAFT]: 'مسودة',
    [VISIT_STATUS.FINAL]: 'نهائية',
    [VISIT_STATUS.AMENDED]: 'معدلة',
    [VISIT_STATUS.LOCKED]: 'مقفلة'
  }
}
// ----------------------------------------------------------------

const computedColor = computed(() => {
  if (props.color) return props.color
  if (props.severity !== 'normal') {
    const severityColorMap = {
      danger: 'danger',
      warning: 'warning',
      success: 'success',
      info: 'info',
      primary: 'primary',
      purple: 'purple',
      grey: 'grey',
    }
    return severityColorMap[props.severity] || 'neutral'
  }
  if (props.status) {
    const map = statusColorMap[props.statusType] || {}
    return map[props.status] || 'neutral'
  }
  return 'neutral'
})

const displayLabel = computed(() => {
  if (props.label) return props.label
  if (props.status) {
    const map = statusLabelMap[props.statusType] || {}
    return map[props.status] || props.status || ''
  }
  return ''
})

const displayIcon = computed(() => {
  if (props.icon) return props.icon
  if (props.status) {
    const map = statusIconMap[props.statusType] || {}
    return map[props.status] || ''
  }
  return ''
})

const arabicValue = computed(() => {
  if (props.value === null || props.value === undefined) return ''
  const num = Number(props.value)
  return isNaN(num) ? props.value : formatNumber(num)
})

const computedClasses = computed(() => {
  const color = computedColor.value
  const variant = props.variant
  const size = props.size

  const classes = []
  if (variant === 'solid') {
    classes.push(`tag--${color}`)
  } else {
    classes.push(`tag--${color}-soft`)
  }

  if (size === 'xs') classes.push('tag--xs')
  else if (size === 'lg') classes.push('tag--lg')

  return classes
})
</script>
