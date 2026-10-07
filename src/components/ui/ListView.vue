<!-- frontend/src/components/ui/ListView.vue -->
<template>
  <div class="list-view">
    <!-- Filters -->
    <FilterBar
      v-if="filters.length"
      :model-value="filterValues"
      :fields="filters"
      class="mb-3"
      @update:model-value="onFilterChange"
      @apply="$emit('filter-apply')"
      @reset="$emit('filter-reset')"
    />

    <!-- Table -->
    <DataTable
      :columns="columns"
      :items="items"
      :loading="pageStatus === 'loading'"
      :loading-more="loadingMore"
      :selectable="selectable"
      :selected-ids="selectedIds"
      :selected-id="selectedId"
      :empty-type="emptyType"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :empty-action-text="emptyActionText"
      :empty-action-url="emptyActionUrl"
      @toggle-all="$emit('toggle-all', $event)"
      @toggle-item="(id) => $emit('toggle-item', id)"
      @row-click="(item) => $emit('row-click', item)"
    >
      <template
        v-for="(_, slot) in $slots"
        :key="slot"
        #[slot]="scope"
      >
        <slot
          :name="slot"
          v-bind="scope"
        />
      </template>
    </DataTable>

    <!-- Load more -->
    <div
      v-if="hasMore"
      class="text-center py-3"
    >
      <span
        v-if="loadingMore"
        class="spinner spinner--sm"
      />
      <BaseButton
        v-else
        variant="secondary"
        size="sm"
        @click="loadMore"
      >
        تحميل المزيد
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted,ref, watch } from 'vue'

import { useDate } from '@/composables/useDate'
import { usePagination } from '@/composables/usePagination'
import { debounce } from '@/utils'

import DataTable from './DataTable.vue'
import FilterBar from './FilterBar.vue'

const props = defineProps({
  columns: { type: Array, required: true },
  fetchFn: { type: Function, required: true },
  filters: { type: Array, default: () => [] },
  filterValues: { type: Object, default: () => ({}) },
  perPage: { type: Number, default: 20 },
  selectable: { type: Boolean, default: false },
  selectedIds: { type: Set, default: () => new Set() },
  selectedId: { type: [Number, String], default: null },
  emptyType: { type: String, default: 'default' },
  emptyTitle: { type: String, default: '' },
  emptyDescription: { type: String, default: '' },
  emptyActionText: { type: String, default: '' },
  emptyActionUrl: { type: [String, Object], default: '' },
  dateFields: { type: Array, default: () => [] },
  refreshKey: { type: [Number, String], default: 0 },
})

const emit = defineEmits([
  'toggle-all',
  'toggle-item',
  'row-click',
  'update:filterValues',
  'filter-apply',
  'filter-reset',
])

const { toISODate, parseDate } = useDate()

const currentFilters = ref({ ...props.filterValues })
const pageStatus = ref('loading')

function normalizeFilters(filters) {
  const normalized = { ...filters }

  for (const key of props.dateFields) {
    const value = normalized[key]
    if (value) {
      const d = parseDate(value)
      if (d) normalized[key] = toISODate(d)
    }
  }

  return normalized
}

const fetchWrapper = async ({ cursor, limit }) => {
  const normalized = normalizeFilters(currentFilters.value)

  return props.fetchFn({
    cursor,
    limit,
    filters: normalized,
  })
}

const {
  items,
  loading: loadingMore,
  hasMore,
  loadNext: loadMore,
  refresh,
} = usePagination({
  fetchFn: fetchWrapper,
  perPage: props.perPage,
  mode: 'cursor',
})

const debouncedRefresh = debounce(() => refresh(), 300)

function onFilterChange(newFilters) {
  currentFilters.value = newFilters
  emit('update:filterValues', newFilters)
  debouncedRefresh()
}

async function initialLoad() {
  try {
    await refresh()
    pageStatus.value = items.value.length ? 'content' : 'empty'
  } catch {
    pageStatus.value = 'error'
  }
}

onMounted(() => {
  initialLoad()
})

watch(
  () => props.filterValues,
  (newValues) => {
    currentFilters.value = { ...newValues }
    refresh()
  },
  { deep: true }
)

watch(
  () => props.refreshKey,
  () => {
    initialLoad()
  }
)
</script>
