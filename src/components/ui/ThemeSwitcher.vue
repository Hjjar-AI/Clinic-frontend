<!-- frontend/src/components/ui/ThemeSwitcher.vue -->
<template>
  <div class="theme-switcher">
    <p class="text-sm text-muted mb-2">
      اختر سمة
    </p>
    <div class="theme-swatches">
      <button
        v-for="t in themes"
        :key="t.value"
        class="theme-swatch"
        :class="{ 'theme-swatch--active': modelValue === t.value }"
        :title="t.label"
        @click="applyTheme(t.value)"
      >
        <span
          class="theme-swatch__color"
          :class="`theme-swatch--${t.value}`"
        />
        <span class="theme-swatch__label">{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { THEMES as themes } from '@/constants/theme'
defineProps({
  // Current theme id, e.g. 'default' or 'ocean-cerulean'.
  // This component is now a controlled input; the parent (Settings.vue)
  // owns the actual persistence through the settings store.
  modelValue: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue'])

function applyTheme(theme) {
  emit('update:modelValue', theme)
}
</script>
