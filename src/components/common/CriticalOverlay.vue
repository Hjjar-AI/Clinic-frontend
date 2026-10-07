<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="critical-overlay"
        :class="`critical-overlay--${type}`"
        @click.self="handleOverlayClick"
      >
        <div class="critical-overlay__card">
          <Icon
            :icon="icon"
            :class="`text-${iconColor} text-2xl mb-3`"
          />
          <h3 class="heading-4 mb-2">
            {{ title }}
          </h3>
          <p
            v-if="message"
            class="text-muted mb-3"
          >
            {{ message }}
          </p>
          <p
            v-if="type === 'timeout' && secondsRemaining"
            class="text-muted mb-3"
          >
            سيتم تسجيل خروجك تلقائياً خلال {{ secondsRemaining }} ثانية.
          </p>
          <div class="flex flex--gap-2 justify-center">
            <BaseButton
              v-if="type === 'timeout'"
              variant="primary"
              @click="$emit('stay')"
            >
              البقاء متصلاً
            </BaseButton>
            <BaseButton
              v-if="type === 'timeout'"
              variant="danger"
              @click="$emit('logout')"
            >
              تسجيل الخروج
            </BaseButton>
          </div>
          <p
            v-if="type === 'phi'"
            class="text-muted mt-1"
          >
            انقر للعودة إلى العرض
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  visible: Boolean,
  type: { type: String, default: 'phi', validator: v => ['phi','timeout'].includes(v) },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  secondsRemaining: { type: Number, default: 0 }
})

const emit = defineEmits(['stay','logout','dismiss'])

const icon = computed(() => props.type === 'phi' ? 'lock' : 'clock')
const iconColor = computed(() => props.type === 'phi' ? 'danger' : 'warning')

function handleOverlayClick() { if (props.type === 'phi') emit('dismiss') }
</script>