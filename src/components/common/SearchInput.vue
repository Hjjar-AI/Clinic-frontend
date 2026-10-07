<template>
  <div
    ref="wrapper"
    :class="variant === 'global' ? 'navbar__search' : 'searchable-select'"
  >
    <div class="input-clear-wrapper">
      <input
        :value="rawQuery"
        :placeholder="placeholder"
        class="form-control"
        :class="{ 'navbar__search-input': variant === 'global' }"
        autocomplete="off"
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
        v-if="rawQuery && !loading"
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
        v-if="open && (results.length || recentSearches.length)"
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
          v-for="item in results"
          :key="getOptionKey(item)"
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
      </ul>
    </Transition>
    <div
      v-if="open && rawQuery.length >= minLength && !results.length && !loading"
      class="no-results text-muted text-sm text-center p-2"
    >
      لا توجد نتائج
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount,onMounted, ref, watch } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { debounce } from '@/utils'

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
const rawQuery = ref('')
const loading = ref(false)
const results = ref([])
const recentSearches = ref([])

let requestSeq = 0

onMounted(() => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (stored) recentSearches.value = JSON.parse(stored)
  } catch { /* Invalid saved search data is safely ignored. */ }
})

watch(() => props.modelValue, (val) => {
  rawQuery.value = val ? getOptionLabel(val) : ''
}, { immediate: true })

function getOptionLabel(opt) { if (!opt) return ''; return typeof props.optionLabel === 'function' ? props.optionLabel(opt) : opt[props.optionLabel] || '' }
function getOptionKey(opt) { if (!opt) return ''; return typeof props.optionKey === 'function' ? props.optionKey(opt) : opt[props.optionKey] || opt.id || '' }

const performSearch = debounce(async (val) => {
  if (val.trim().length < props.minLength) { results.value = []; loading.value = false; return }
  const seq = ++requestSeq
  loading.value = true
  try {
    const data = await props.searchFn(val)
    if (seq === requestSeq) {
      results.value = data
      open.value = true
    }
  } catch {
    if (seq === requestSeq) results.value = []
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}, 300)

function onInput(val) {
  rawQuery.value = val
  if (props.modelValue && val !== getOptionLabel(props.modelValue)) {
    emit('update:modelValue', null)
    emit('select', null)
  }
  performSearch(val)
}

function saveRecent(term) {
  if (!term.trim()) return
  const current = recentSearches.value.filter(t => t !== term)
  current.unshift(term)
  recentSearches.value = current.slice(0, MAX_RECENT)
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches.value))
  } catch { /* quota exceeded or other error – silently ignore */ }
}

function select(opt) {
  saveRecent(getOptionLabel(opt))
  emit('update:modelValue', opt); emit('select', opt)
  rawQuery.value = getOptionLabel(opt)
  open.value = false
}

function selectRecent(term) {
  rawQuery.value = term
  performSearch(term)
}

function clear() {
  emit('update:modelValue', null); emit('select', null)
  rawQuery.value = ''
  open.value = false
  results.value = []
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
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
