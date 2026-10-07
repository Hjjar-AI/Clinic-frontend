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
  try {
    const response = await apiClient.get(props.url, {
      cancelToken: source.token
    })
    const inner = response.data?.data || response.data
    const result = Array.isArray(inner)
      ? inner
      : (inner[Object.keys(inner)[0]] || inner.results || [])
    options.value = result
  } catch (e) {
    if (!apiClient.isCancel?.(e)) {
      console.error('ApiSelect load error', e)
    }
  } finally {
    loading.value = false
    cancelTokenSource = null
  }
}

watch(() => props.url, () => {
  fetchOptions()
})

onMounted(() => { fetchOptions() })

onBeforeUnmount(() => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Component unmounted')
  }
})
</script>
