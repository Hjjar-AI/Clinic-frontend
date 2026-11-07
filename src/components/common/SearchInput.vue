<template>
  <div
    ref="wrapper"
    @focusout="onFocusOut"
    :class="variant === 'global' ? 'navbar__search' : 'searchable-select'"
  >
    <div class="input-clear-wrapper">
      <input
        :value="rawQuery"
        :placeholder="placeholder"
        class="form-control"
        :class="{ 'navbar__search-input': variant === 'global' }"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open && Boolean(panelRef)"
        :aria-controls="listId"
        :aria-activedescendant="activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined"
        @keydown="onKeydown"
        :aria-label="placeholder"
        @input="onInput($event.target.value)"
        @focus="open = true"
      >
      <span
        v-if="loading && variant === 'global'"
        class="search-spinner"
      >
        <span class="spinner spinner--xs spinner--primary" />
      </span>
      <BaseButton
        v-if="rawQuery"
        variant="ghost"
        size="xs"
        class="input-clear-btn"
        aria-label="مسح"
        icon="cancel"
        @click="clear"
      />
    </div>
    <Transition name="dropdown-fade">
      <ul
        v-if="open && (rawQuery.trim().length >= minLength || recentSearches.length)"
        :id="listId"
        ref="panelRef"
        role="listbox"
        :style="positionStyle"
        class="search-results"
        :class="{ 'navbar__search-results': variant === 'global' }"
      >
        <template v-if="!rawQuery && recentSearches.length">
          <li class="search-results__heading">
            عمليات البحث الأخيرة
          </li>
          <li
            v-for="(term, idx) in recentSearches"
            :key="'recent-'+idx"
          >
            <BaseButton
              class="search-result-item"
              @click="selectRecent(term)"
            >
              <Icon icon="history" /> {{ term }}
            </BaseButton>
          </li>
        </template>
        <li
          v-for="(item, index) in results"
          :id="`${listId}-${index}`"
          role="option"
          :aria-selected="index === activeIndex"
          :key="getOptionKey(item)"
          :class="{ 'search-result--active': index === activeIndex }"
        >
          <BaseButton
            class="search-result-item"
            :class="{ 'navbar__search-result-button': variant === 'global' }"
            @click="select(item)"
          >
            <slot
              name="option"
              :item="item"
            >
              <span v-if="highlight && rawQuery">
                <template
                  v-for="(part, partIndex) in highlightParts(getOptionLabel(item), rawQuery)"
                  :key="partIndex"
                >
                  <mark v-if="part.match">{{ part.text }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
              <span v-else>{{ getOptionLabel(item) }}</span>
            </slot>
          </BaseButton>
        </li>
        <li v-if="loading" role="presentation" class="text-muted p-2">جاري البحث...</li>
        <li v-else-if="rawQuery.trim().length >= minLength && !results.length" role="presentation" class="no-results text-muted text-sm text-center p-2">لا توجد نتائج</li>
      </ul>
    </Transition>

  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { useSearch } from '@/composables/useSearch'
import { useFloatingPosition } from '@/composables/useFloatingPosition'

const RECENT_SEARCHES_KEY = STORAGE_KEYS.RECENT_SEARCHES
const MAX_RECENT = 5

const props = defineProps({
  modelValue: { type: Object, default: null },
  searchFn: { type: Function, required: true },
  optionLabel: { type: [String, Function], default: 'label' },
  optionKey: { type: [String, Function], default: 'value' },
  placeholder: { type: String, default: 'ابحث...' },
  minLength: { type: Number, default: 2 },
  variant: { type: String, default: 'inline', validator: v => ['inline','global'].includes(v) },
  highlight: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'select'])

const wrapper = ref(null)
const open = ref(false)
const { query: rawQuery, loading, results, onInput: search, clear: clearSearch } = useSearch(
  value => props.searchFn(value), { minLength: props.minLength },
)
const { panelRef, positionStyle } = useFloatingPosition(wrapper, { active: open, maxHeight: 240 })
const listId = `search-${useId()}`
const activeIndex = ref(-1)
const recentSearches = ref([])

onMounted(() => {
  // Historical patient labels must not survive the session in browser storage.
  try { localStorage.removeItem(RECENT_SEARCHES_KEY) } catch { /* Storage can be unavailable. */ }
})

watch(() => props.modelValue, (val, previous) => {
  if (val) rawQuery.value = getOptionLabel(val)
  else if (rawQuery.value === getOptionLabel(previous)) rawQuery.value = ''
}, { immediate: true })

function getOptionLabel(opt) { if (!opt) return ''; return typeof props.optionLabel === 'function' ? props.optionLabel(opt) : opt[props.optionLabel] || '' }
function getOptionKey(opt) { if (!opt) return ''; return typeof props.optionKey === 'function' ? props.optionKey(opt) : opt[props.optionKey] || opt.id || '' }

function onInput(val) {
  activeIndex.value = -1
  results.value = []
  search(val)
  open.value = val.trim().length >= props.minLength || recentSearches.value.length > 0
  if (props.modelValue && val !== getOptionLabel(props.modelValue)) {
    emit('update:modelValue', null)
    emit('select', null)
  }
}

function dismiss() {
  const value = rawQuery.value
  clearSearch()
  rawQuery.value = value
  activeIndex.value = -1
  open.value = false
}

function onFocusOut(event) {
  if (!wrapper.value?.contains(event.relatedTarget)) dismiss()
}

function onKeydown(event) {
  if (event.key === 'Escape' || event.key === 'Tab') {
    if (event.key === 'Escape') event.preventDefault()
    dismiss()
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    open.value = true
    if (results.value.length) {
      activeIndex.value = activeIndex.value < 0
        ? (event.key === 'ArrowDown' ? 0 : results.value.length - 1)
        : (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + results.value.length) % results.value.length
      panelRef.value?.querySelectorAll('[role=option]')[activeIndex.value]?.scrollIntoView?.({ block: 'nearest' })
    }
  } else if (event.key === 'Enter' && open.value && activeIndex.value >= 0) {
    event.preventDefault()
    select(results.value[activeIndex.value])
  }
}

function saveRecent(term) {
  if (!term.trim()) return
  const current = recentSearches.value.filter(t => t !== term)
  current.unshift(term)
  recentSearches.value = current.slice(0, MAX_RECENT)

}

function select(opt) {
  saveRecent(getOptionLabel(opt))
  emit('update:modelValue', opt); emit('select', opt)
  dismiss()
  rawQuery.value = getOptionLabel(opt)
}

function selectRecent(term) {
  onInput(term)
}

function clear() {
  emit('update:modelValue', null); emit('select', null)
  clearSearch()
  activeIndex.value = -1
  open.value = false
}

function highlightParts(text, search) {
  if (!search) return [{ text, match: false }]
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return String(text).split(regex).filter(Boolean).map((part) => ({
    text: part,
    match: part.toLocaleLowerCase() === search.toLocaleLowerCase(),
  }))
}

function handleClickOutside(event) {
  if (wrapper.value && !wrapper.value.contains(event.target)) {
    dismiss()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => { dismiss(); document.removeEventListener('click', handleClickOutside) })
</script>
