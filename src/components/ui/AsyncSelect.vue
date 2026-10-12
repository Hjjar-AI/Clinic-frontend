<template>
  <div class="async-select">
    <template v-if="mode === 'search'">
      <SearchInput
        v-model="selected"
        :search-fn="fetchOptions"
        :option-label="optionLabel"
        :option-key="optionKey"
        :placeholder="placeholder"
        :min-length="minLength"
        variant="inline"
        @select="$emit('update:modelValue', $event)"
      />
    </template>
    <template v-else>
      <FormField
        :label="label"
        :required="required"
        :error="error"
      >
        <select
          :value="modelValue"
          class="form-control form-control--select"
          :disabled="loading || disabled"
          :required="required"
          :aria-label="label || placeholder"
          :aria-invalid="Boolean(error)"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option
            value=""
            disabled
          >
            {{ placeholder }}
          </option>
          <option
            v-for="opt in options"
            :key="opt[valueKey]"
            :value="opt[valueKey]"
          >
            {{ getLabel(opt) }}
          </option>
        </select>
      <small v-if="loadError" role="alert" class="text-danger">{{ loadError }} <button type="button" @click="fetchOptions()">إعادة المحاولة</button></small>
        <span
          v-if="loading"
          class="async-select-spinner"
        ><span class="spinner spinner--xs spinner--primary" /></span>
      </FormField>
    </template>
  </div>
</template>

<script setup>
import { onBeforeUnmount,onMounted, ref, watch } from 'vue'

import SearchInput from '@/components/common/SearchInput.vue'
import apiClient from '@/services/apiClient'
import { optionList } from '@/utils/optionList'

import FormField from './FormField.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  mode: { type: String, default: 'dropdown', validator: v => ['dropdown', 'search'].includes(v) },
  url: { type: String, default: '' },
  label: { type: String, default: '' },
  required: Boolean,
  error: { type: String, default: '' },
  placeholder: { type: String, default: 'اختر...' },
  valueKey: { type: String, default: 'id' },
  labelKey: { type: String, default: 'name' },
  labelFn: { type: Function, default: null },
  disabled: { type: Boolean, default: false },
  minLength: { type: Number, default: 2 },
  optionLabel: { type: [String, Function], default: 'label' },
  optionKey: { type: [String, Function], default: 'value' },
})

defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)
const selected = ref(props.modelValue)
watch(() => props.modelValue, value => { selected.value = value })
let cancelTokenSource = null
let disposed = false
const loadError = ref('')

function getLabel(opt) {
  if (props.labelFn) return props.labelFn(opt)
  return opt[props.labelKey]
}

async function fetchOptions(query) {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('New request')
  }
  const source = apiClient.CancelToken.source()
  cancelTokenSource = source

  loading.value = true
  loadError.value = ''
  options.value = []
  try {
    const response = await apiClient.get(props.url, {
      params: query ? { q: query } : undefined,
      cancelToken: source.token
    })
    if (disposed || source !== cancelTokenSource) return []
    const result = optionList(response)
    if (props.mode === 'dropdown') {
      options.value = result
    } else {
      return result
    }
  } catch (e) {
    if (!disposed && source === cancelTokenSource && !apiClient.isCancel(e)) loadError.value = 'تعذر تحميل الخيارات'
    return []
  } finally {
    if (source === cancelTokenSource) { loading.value = false; cancelTokenSource = null }
  }
}

watch(() => props.url, () => {
  if (props.mode === 'dropdown' && props.url) {
    fetchOptions()
  }
})

onMounted(() => {
  if (props.mode === 'dropdown' && props.url) {
    fetchOptions()
  }
})

onBeforeUnmount(() => {
  disposed = true
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Component unmounted')
  }
})
</script>
