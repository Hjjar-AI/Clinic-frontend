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
          :style="themeColors[t.value] ? { backgroundColor: themeColors[t.value] } : {}"
        />
        <span class="theme-swatch__label">{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted,reactive } from 'vue'

defineProps({
  // Current theme id, e.g. 'default' or 'ocean-cerulean'.
  // This component is now a controlled input; the parent (Settings.vue)
  // owns the actual persistence through the settings store.
  modelValue: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue'])

const themes = [
  { value: 'default', label: 'افتراضي' },
  { value: 'prussian-orange', label: 'بروسي برتقالي' },
  { value: 'vanilla-tangerine', label: 'فانيليا تانجيرين' },
  { value: 'ink-wheat-burnt', label: 'حبر قمح محروق' },
  { value: 'deep-space-strawberry', label: 'فضاء عميق فراولة' },
  { value: 'ocean-cerulean', label: 'محيط سيريولين' },
  { value: 'rosewood-crimson', label: 'روزوود قرمزي' },
  { value: 'dusk-dusty-rosewood', label: 'غسق وردي مغبر' },
]

const themeColors = reactive({})

/**
 * Read each theme's `--color-primary` directly from CSS by temporarily
 * applying the theme class to <body> and reading the resolved custom
 * property. This keeps the theme CSS files as the single source of truth
 * for color values.
 */
function sampleThemeColors() {
  const body = document.body
  const savedClass = body.className
  for (const t of themes) {
    body.className = `theme-${t.value}`
    const color = getComputedStyle(body).getPropertyValue('--color-primary').trim()
    themeColors[t.value] = color || ''
  }
  body.className = savedClass
}

onMounted(() => {
  sampleThemeColors()
})

function applyTheme(theme) {
  emit('update:modelValue', theme)
}
</script>
