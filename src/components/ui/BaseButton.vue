<template>
  <component
    :is="componentTag"
    :to="to"
    :href="href"
    :type="componentTag === 'button' ? (to || href ? undefined : 'button') : undefined"
    class="btn"
    :class="[variantClass, sizeClass, { 'btn--loading': loading, 'btn--block': block }]"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-label="ariaLabel || undefined"
    :target="href && !href.startsWith('#') ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    prefetch
    @click="handleClick"
  >
    <Icon
      v-if="icon && !loading"
      :icon="icon"
      class="btn__icon"
    />
    <span
      v-if="loading"
      class="spinner spinner--sm btn__spinner"
    />
    <slot>{{ loading ? loadingText : defaultText }}</slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useConfirmStore } from '@/stores/confirm'

import Icon from './Icon.vue'

const props = defineProps({
  variant: { type: String, default: 'secondary' },
  disabled: Boolean,
  loading: Boolean,
  icon: { type: String, default: '' },
  loadingText: { type: String, default: 'جاري التحميل...' },
  defaultText: { type: String, default: '' },
  size: { type: String, default: 'md' },
  ariaLabel: { type: String, default: '' },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  confirmMessage: { type: String, default: '' },
  confirmTitle: { type: String, default: 'تأكيد' },
  confirmOkText: { type: String, default: 'نعم' },
  confirmCancelText: { type: String, default: 'إلغاء' },
  confirmHeaderVariant: { type: String, default: 'danger' },
  confirmCheckbox: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'confirmed'])

const componentTag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const variantClass = computed(() => `btn--${props.variant}`)
const sizeClass = computed(() => {
  if (props.size === 'xs') return 'btn--xs'
  if (props.size === 'sm') return 'btn--sm'
  if (props.size === 'lg') return 'btn--lg'
  return ''
})

const confirmStore = useConfirmStore()

async function handleClick() {
  if (props.confirmMessage) {
    const ok = await confirmStore.confirm(props.confirmMessage, {
      confirmText: props.confirmOkText,
      cancelText: props.confirmCancelText,
      headerVariant: props.confirmHeaderVariant,
      requireCheckbox: props.confirmCheckbox,
      checkboxLabel: 'أفهم العواقب',
    })
    if (!ok) return
    emit('confirmed')
  }

  if (!props.to) {
    emit('click')
  }
}
</script>
