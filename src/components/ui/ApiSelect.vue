<!-- frontend/src/components/ui/ApiSelect.vue -->
<template>
  <FormField
    :label="label"
    :required="required"
    :field-id="computedId"
    :error="error"
  >
    <div class="api-select-wrapper">
      <select
        :id="computedId"
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
        class="api-select-spinner"
      >
        <i class="fas fa-spinner fa-spin" />
      </span>
    </div>
  </FormField>
</template>

<script setup>
import { computed, onBeforeUnmount,onMounted, ref, useId, watch } from 'vue'

import FormField from '@/components/ui/FormField.vue'
import apiClient from '@/services/apiClient'
import { optionList } from '@/utils/optionList'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  required: Boolean,
  fieldId: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: 'اختر...' },
  url: { type: String, required: true },
  valueKey: { type: String, default: 'id' },
  labelKey: { type: String, default: 'name' },
  labelFn: { type: Function, default: null },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)
const fallbackId = `api-select-${useId()}`
const computedId = computed(() => props.fieldId || fallbackId)
let cancelTokenSource = null
let disposed = false
const loadError = ref('')

function getLabel(opt) {
  if (props.labelFn) return props.labelFn(opt)
  return opt[props.labelKey]
}

async function fetchOptions() {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Newer request made')
  }
  const source = apiClient.CancelToken.source()
  cancelTokenSource = source

  loading.value = true
  loadError.value = ''
  options.value = []
  try {
    const response = await apiClient.get(props.url, {
      cancelToken: source.token
    })
    if (disposed || source !== cancelTokenSource) return []
    const result = optionList(response)
    options.value = result
  } catch (e) {
    if (!disposed && source === cancelTokenSource && !apiClient.isCancel(e)) loadError.value = 'تعذر تحميل الخيارات'
    return []
  } finally {
    if (source === cancelTokenSource) { loading.value = false; cancelTokenSource = null }
  }
}

watch(() => props.url, () => {
  fetchOptions()
})

onMounted(() => { fetchOptions() })

onBeforeUnmount(() => {
  disposed = true
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Component unmounted')
  }
})
</script>
