<template>
  <div class="catalog-entry-select">
    <SearchInput
      ref="search"
      :search-fn="findOptions"
      :option-label="optionLabel"
      :option-key="optionKey"
      :placeholder="placeholder"
      :min-length="minLength"
      @query-change="query = $event"
      @select="select"
    />
    <div
      v-if="modelValue.length"
      class="catalog-entry-select__selected flex flex--wrap gap-1 mb-2"
    >
      <span
        v-for="(item, index) in modelValue"
        :key="index"
        class="tag tag--primary-soft"
        :class="{ 'tag--warning-soft': item.duplicate }"
      >
        {{ optionLabel(item) }}
        <button
          type="button"
          class="catalog-entry-select__remove ml-1"
          aria-label="إزالة"
          @click="remove(index)"
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
  </div>
</template>
<script setup>
import { nextTick, ref } from 'vue'

import SearchInput from '@/components/common/SearchInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Icon from '@/components/ui/Icon.vue'
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  searchFn: { type: Function, required: true },
  optionLabel: { type: Function, required: true },
  optionKey: { type: Function, required: true },
  createCustom: { type: Function, required: true },
  initialOptions: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'ابحث...' },
  customLabel: { type: String, default: 'إضافة مخصص' },
  minLength: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])
const query = ref(''),
  search = ref(null)
async function findOptions(value) {
  const results = value ? await props.searchFn(value) : props.initialOptions
  return results.filter((item) => props.optionKey(item) != null).slice(0, 20)
}
function update(items) {
  const seen = new Set()
  emit(
    'update:modelValue',
    items.map((item) => {
      const key = props.optionKey(item),
        duplicate = key != null && key !== '' && seen.has(key)
      if (key != null && key !== '') seen.add(key)
      return { ...item, duplicate }
    }),
  )
}
function resetSearch() {
  query.value = ''
  search.value?.clear()
}
function select(item) {
  if (!item) return
  if (
    !props.modelValue.some(
      (selected) => props.optionKey(selected) === props.optionKey(item),
    )
  )
    update([...props.modelValue, { ...item }])
  nextTick(resetSearch)
}
function remove(index) {
  update(props.modelValue.filter((_, itemIndex) => itemIndex !== index))
}
function addCustom() {
  update([...props.modelValue, props.createCustom(query.value)])
  resetSearch()
}
</script>
