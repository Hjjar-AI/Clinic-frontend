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
import { statusPresentation } from '@/constants/statusPresentation'

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

const presentation = computed(() =>
  statusPresentation(props.statusType, props.status),
)

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
  if (props.status || props.statusType === 'risk') {
    return presentation.value.color
  }
  return 'neutral'
})

const displayLabel = computed(() => {
  if (props.label) return props.label
  if (props.status || props.statusType === 'risk') {
    return presentation.value.label
  }
  return ''
})

const displayIcon = computed(() => {
  if (props.icon) return props.icon
  if (props.status || props.statusType === 'risk') {
    return presentation.value.icon
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
