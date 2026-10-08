<template>
  <div
    v-if="variant === 'page'"
    class="page-header-new"
  >
    <div>
      <h1>{{ title }}</h1>
      <p
        v-if="subtitle"
        class="text-sm text-soft mt-1"
      >
        {{ subtitle }}
      </p>
    </div>
    <div class="page-header-new__actions flex gap-2 flex--wrap">
      <slot name="actions">
        <slot />
      </slot>
    </div>
  </div>

  <div
    v-else-if="variant === 'card'"
    class="card__header"
    :class="`card__header--${headerVariant}`"
  >
    <Icon
      v-if="icon"
      :icon="icon"
    />
    <div class="card__header__text">
      <slot name="title">
        <span class="card__header__title">{{ title }}</span>
      </slot>
      <slot name="subtitle" />
    </div>
    <slot />
  </div>
</template>

<script setup>
import Icon from './Icon.vue'

defineProps({
  variant: {
    type: String,
    required: true,
    validator: (v) => ['page', 'card'].includes(v)
  },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  headerVariant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral','primary','warning','danger','success','purple'].includes(v)
  }
})
</script>