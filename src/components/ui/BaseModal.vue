<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      ref="modalOverlay"
      class="modal"
      :class="sizeClass"
      tabindex="-1"
      @click.self="close"
    >
      <Transition name="modal">
        <BaseCard
          v-if="modelValue"
          ref="modalContent"
          class="modal__content"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <template #header>
            <div
              v-if="isMobile"
              class="modal__handle"
              aria-hidden="true"
            />
            <header :class="headerVariantClass">
              <div class="flex flex--center gap-2">
                <Icon
                  v-if="headerIcon"
                  :icon="headerIcon"
                  class="modal__header-icon"
                />
                <h2
                  :id="titleId"
                  class="modal-heading"
                >
                  {{ title }}
                </h2>
              </div>
              <BaseButton
                variant="ghost"
                class="modal__close"
                aria-label="إغلاق"
                @click="close"
              >
                <Icon icon="cancel" />
              </BaseButton>
            </header>
          </template>

          <div
            v-if="$slots.default"
            :id="descriptionId"
            class="modal__body position-relative"
          >
            <slot />
            <div
              v-if="loading"
              class="modal-body-loading"
            >
              <Spinner
                size="lg"
                variant="primary"
              />
            </div>
          </div>

          <template
            v-if="$slots.footer || confirmText"
            #footer
          >
            <div class="modal__footer">
              <slot name="footer">
                <BaseButton
                  variant="secondary"
                  :disabled="loading"
                  @click="close"
                >
                  إلغاء
                </BaseButton>
                <BaseButton
                  v-if="confirmText"
                  :variant="confirmClass"
                  :disabled="loading"
                  @click="$emit('confirm')"
                >
                  {{ confirmText }}
                </BaseButton>
              </slot>
            </div>
          </template>
        </BaseCard>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useOverlay } from '@/composables/useOverlay'
import Spinner from '@/components/common/Spinner.vue'

import BaseButton from './BaseButton.vue'
import BaseCard from './BaseCard.vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  confirmClass: { type: String, default: 'primary' },
  size: { type: String, default: 'md', validator: v => ['xs','sm','md','lg','xl'].includes(v) },
  headerVariant: { type: String, default: 'primary', validator: v => ['primary','info','success','warning','danger','neutral','purple'].includes(v) },
  descriptionId: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const modalContent = ref(null)
const modalOverlay = ref(null)

const titleId = `modal-title-${crypto.randomUUID()}`
const descriptionId = props.descriptionId || `modal-desc-${crypto.randomUUID()}`

const windowWidth = ref(window.innerWidth)
const onResize = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
const isMobile = computed(() => windowWidth.value <= 768)

const sizeClass = computed(() => ({ xs: 'modal--xs', sm: 'modal--sm', md: 'modal--md', lg: 'modal--lg', xl: 'modal--xl' }[props.size] || 'modal--md'))
const headerVariantClass = computed(() => props.headerVariant === 'primary' ? '' : `modal__header--${props.headerVariant}`)
const headerIcon = computed(() => ({ info: 'info-circle', success: 'check-circle', warning: 'exclamation-triangle', danger: 'exclamation-circle', neutral: '', purple: 'crown' }[props.headerVariant] || ''))

useOverlay(() => props.modelValue, () => modalOverlay.value, close)

function close() { emit('update:modelValue', false) }
</script>

<style scoped src="../../styles/components/ui/base-modal.css"></style>
