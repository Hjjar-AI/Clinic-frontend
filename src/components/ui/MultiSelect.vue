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
      <!-- Inline search mode -->
      <template v-if="mode === 'inline'">
        <div class="flex flex--gap-2 mb-2">
          <div class="flex--grow relative">
            <input
              :value="searchQuery"
              :placeholder="placeholder"
              class="form-control"
              autocomplete="off"
              :aria-label="label || placeholder"
              @input="onSearchInput($event.target.value)"
              @focus="open = true"
            >
            <div
              v-if="open && filteredOptions.length"
              class="autocomplete-dropdown"
            >
              <button
                v-for="opt in filteredOptions"
                :key="getOptionKey(opt)"
                class="autocomplete-item"
                type="button"
                @click="select(opt)"
              >
                {{ getOptionLabel(opt) }}
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="modelValue.length"
          class="selected-list flex flex--wrap gap-1 mb-2"
        >
          <span
            v-for="(item, idx) in modelValue"
            :key="getOptionKey(item) || idx"
            class="tag tag--primary-soft"
            :class="{ 'tag--warning-soft': item.duplicate }"
          >
            {{ getOptionLabel(item) }}
            <button
              class="icon-btn-danger ml-1"
              aria-label="إزالة"
              @click="removeItem(item)"
            >
              <Icon
                icon="cancel"
                size="xs"
              />
            </button>
            <Icon
              v-if="item.duplicate"
              icon="exclamation-circle"
              class="text-warning ml-1"
            />
          </span>
        </div>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="addCustom"
        >
          + {{ customLabel }}
        </BaseButton>
      </template>

      <!-- Default dropdown mode -->
      <template v-else>
        <BaseButton
          class="multi-select__tags"
          aria-haspopup="listbox"
          :aria-expanded="open"
          @click="toggleOpen"
        >
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
          <span
            v-if="!modelValue.length"
            class="text-muted"
          >{{ placeholder }}</span>
          <span
            v-else
            class="multi-select__add-hint"
          >+ أضف</span>
        </BaseButton>
        <div
          v-if="open"
          class="multi-select__dropdown"
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
            <span
              class="checkbox"
              style="width:100%;"
            >
              <input
                type="checkbox"
                :checked="isSelected(getOptionKey(opt))"
                class="checkbox__input"
                :aria-label="getOptionLabel(opt)"
                @click.stop="toggleItem(getOptionKey(opt))"
              >
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
      </template>
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
  optionLabel: { type: Function, default: (opt) => opt.label || opt.name || '' },
  optionKey: { type: Function, default: (opt) => opt.value || opt.id || opt.code },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  required: { type: Boolean, default: false },
  mode: { type: String, default: 'dropdown', validator: v => ['dropdown','inline'].includes(v) },
  customLabel: { type: String, default: 'إضافة مخصص' },
  searchFn: { type: Function, default: null },
  initialOptions: { type: Array, default: () => [] },
  minLength: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const searchQuery = ref('')
const wrapper = ref(null)
const loading = ref(false)
const fetchedOptions = ref([])   // for dropdown async fetch
const allOptions = ref(props.initialOptions || [])  // used in inline mode

// Watch initialOptions to reset allOptions if parent changes
watch(() => props.initialOptions, (newVal) => {
  if (props.mode === 'inline') {
    allOptions.value = newVal || []
  }
}, { deep: false })

const effectiveOptions = computed(() => {
  if (props.mode === 'inline') return allOptions.value
  return props.fetchOptions ? fetchedOptions.value : props.options
})

const filteredOptions = computed(() => {
  let opts = effectiveOptions.value.filter(o => props.optionKey(o) !== undefined)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    opts = opts.filter(o => props.optionLabel(o).toLowerCase().includes(q))
  }
  return opts.slice(0, 20)
})

function getOptionKey(opt) { return props.optionKey(opt) }
function getOptionLabel(opt) { return props.optionLabel(opt) }
function getLabel(value) { const option = effectiveOptions.value.find(o => props.optionKey(o) === value); return option ? props.optionLabel(option) : value }
function isSelected(value) { return props.modelValue.includes(value) }

function toggleItem(value) {
  if (isSelected(value)) emit('update:modelValue', props.modelValue.filter(v => v !== value))
  else emit('update:modelValue', [...props.modelValue, value])
}
function removeItem(value) { emit('update:modelValue', props.modelValue.filter(v => v !== value)) }

function toggleOpen() {
  open.value = !open.value
  if (open.value && props.fetchOptions && !fetchedOptions.value.length) loadOptions('')
}
async function loadOptions(query) {
  if (!props.fetchOptions) return
  loading.value = true
  try { const data = await props.fetchOptions(query); fetchedOptions.value = data } catch { fetchedOptions.value = [] } finally { loading.value = false }
}
const onSearch = debounce(() => { if (props.fetchOptions) loadOptions(searchQuery.value) }, 300)

async function onSearchInput(val) {
  searchQuery.value = val
  if (props.mode !== 'inline' || !props.searchFn) return
  if (val.trim().length >= props.minLength) {
    loading.value = true
    try {
      const results = await props.searchFn(val.trim())
      allOptions.value = results
      open.value = true
    } catch {
      allOptions.value = props.initialOptions || []
    } finally {
      loading.value = false
    }
  } else {
    allOptions.value = props.initialOptions || []
    open.value = true
  }
}

function select(opt) {
  if (props.mode !== 'inline') return
  const exists = props.modelValue.some(s => props.optionKey(s) === props.optionKey(opt))
  if (!exists) {
    const newItem = { ...opt, duplicate: false }
    const updated = checkDuplicates([...props.modelValue, newItem])
    emit('update:modelValue', updated)
  }
  searchQuery.value = ''
  open.value = false
}

function addCustom() {
  if (props.mode !== 'inline') return
  const custom = { id: null, code: '', name: searchQuery.value || '', arabic_name: searchQuery.value || '', custom_name: searchQuery.value || '', custom_code: '', duplicate: false }
  const updated = checkDuplicates([...props.modelValue, custom])
  emit('update:modelValue', updated)
  searchQuery.value = ''
  open.value = false
}

function checkDuplicates(list) {
  const seen = new Set()
  list.forEach(item => {
    const key = props.optionKey(item)
    if (!key) return
    if (seen.has(key)) item.duplicate = true
    else { seen.add(key); item.duplicate = false }
  })
  return list
}

function handleClickOutside(event) {
  if (wrapper.value && !wrapper.value.contains(event.target)) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
