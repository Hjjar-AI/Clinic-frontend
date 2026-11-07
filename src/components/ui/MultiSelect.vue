<template>
  <FormField
    :label="label"
    :error="error"
    :help="help"
    :required="required"
  >
    <div
      ref="wrapper"
      class="multi-select"
    >
      <div class="multi-select__tags">
        <span
          v-for="val in modelValue"
          :key="val"
          class="tag tag--info-soft mr-1"
        >
          {{ getLabel(val) }}
          <button
            class="multi-select__remove"
            type="button"
            aria-label="إزالة"
            @click.stop="removeItem(val)"
          >
            <Icon
              icon="cancel"
              size="xs"
            />
          </button>
        </span>
        <button
          type="button"
          aria-haspopup="listbox"
          :aria-expanded="open"
          @click="toggleOpen"
        >
          <span
            v-if="!modelValue.length"
            class="text-muted"
          >{{
            placeholder
          }}</span>
          <span
            v-else
            class="multi-select__add-hint"
          >+ أضف</span>
        </button>
      </div>
      <div
        v-if="open"
        class="multi-select__dropdown"
        role="listbox"
        aria-multiselectable="true"
      >
        <div
          v-if="searchable || fetchOptions"
          class="multi-select__search"
        >
          <input
            v-model="searchQuery"
            class="form-control form-control--small"
            placeholder="بحث..."
            :aria-label="`بحث في ${label || 'الخيارات'}`"
            @input="onSearch"
          >
        </div>
        <div
          v-if="loading"
          class="text-center py-2"
        >
          <span class="spinner spinner--sm" />
        </div>
        <button
          v-for="opt in filteredOptions"
          :key="getOptionKey(opt)"
          class="multi-select__option"
          type="button"
          role="option"
          :aria-selected="isSelected(getOptionKey(opt))"
          @click="toggleItem(getOptionKey(opt))"
        >
          <span class="checkbox w-100">
            <span aria-hidden="true">{{
              isSelected(getOptionKey(opt)) ? '☑' : '☐'
            }}</span>
            {{ getOptionLabel(opt) }}
          </span>
        </button>
        <div
          v-if="!filteredOptions.length"
          class="p-2 text-muted text-sm"
        >
          لا توجد نتائج
        </div>
      </div>
      <small
        v-if="loadError"
        role="alert"
        class="text-danger"
      >{{
        loadError
      }}</small>
    </div>
  </FormField>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import { debounce } from '@/utils'

import FormField from './FormField.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'اختر...' },
  searchable: { type: Boolean, default: false },
  fetchOptions: { type: Function, default: null },
  optionLabel: {
    type: Function,
    default: (opt) => opt.label || opt.name || '',
  },
  optionKey: {
    type: Function,
    default: (opt) => opt.value ?? opt.id ?? opt.code,
  },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const searchQuery = ref('')
const wrapper = ref(null)
const loading = ref(false)
const loadError = ref('')
let generation = 0
let disposed = false
watch(
  open,
  (visible) => {
    if (!visible) {
      generation += 1
      onSearch.cancel()
      loading.value = false
    }
  },
  { flush: 'sync' },
)
const fetchedOptions = ref([]) // for dropdown async fetch
const effectiveOptions = computed(() =>
  props.fetchOptions ? fetchedOptions.value : props.options,
)

const filteredOptions = computed(() => {
  let opts = effectiveOptions.value.filter((o) => props.optionKey(o) != null)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    opts = opts.filter((o) => props.optionLabel(o).toLowerCase().includes(q))
  }
  return opts.slice(0, 20)
})

function getOptionKey(opt) {
  return props.optionKey(opt)
}
function getOptionLabel(opt) {
  return props.optionLabel(opt)
}
function getLabel(value) {
  const option = effectiveOptions.value.find(
    (o) => props.optionKey(o) === value,
  )
  return option ? props.optionLabel(option) : value
}
function isSelected(value) {
  return props.modelValue.includes(value)
}

function toggleItem(value) {
  if (isSelected(value))
    emit(
      'update:modelValue',
      props.modelValue.filter((v) => v !== value),
    )
  else emit('update:modelValue', [...props.modelValue, value])
}
function removeItem(value) {
  emit(
    'update:modelValue',
    props.modelValue.filter((v) => v !== value),
  )
}

function toggleOpen() {
  open.value = !open.value
  if (open.value && props.fetchOptions && !fetchedOptions.value.length)
    loadOptions(searchQuery.value)
}
async function loadOptions(query) {
  const request = ++generation
  loading.value = true
  loadError.value = ''
  try {
    const data = await props.fetchOptions(query)
    if (!disposed && request === generation)
      fetchedOptions.value = Array.isArray(data) ? data : []
  } catch {
    if (request === generation) loadError.value = 'تعذر تحميل الخيارات'
  } finally {
    if (request === generation) loading.value = false
  }
}
const delayedSearch = debounce(() => {
  if (props.fetchOptions) loadOptions(searchQuery.value)
}, 300)
function onSearch() {
  generation += 1
  delayedSearch()
}
onSearch.cancel = delayedSearch.cancel
function handleClickOutside(event) {
  if (wrapper.value && !wrapper.value.contains(event.target)) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => {
  disposed = true
  generation += 1
  delayedSearch.cancel()
  document.removeEventListener('click', handleClickOutside)
})
</script>
