<!-- frontend/src/components/ui/DataTable.vue -->
<template>
  <div class="data-table-wrapper">
    <details v-if="preferenceKey && columns.length > 1" class="table-column-controls">
      <summary>الأعمدة</summary>
      <label v-for="(column, index) in columns" :key="column.key"><input type="checkbox" :checked="visibleColumns.some(item => item.key === column.key)" :disabled="index === 0" @change="toggleColumn(column.key)"> {{ column.label }}</label>
      <button class="btn btn--secondary btn--sm" type="button" @click="restoreColumns">استعادة الأعمدة</button>
    </details>
    <FilterBar
      v-if="filters"
      :model-value="filterValues"
      :fields="filters"
      variant="bar"
      class="mb-3"
      @update:model-value="onFilterUpdate"
      @apply="$emit('filter-apply')"
      @reset="$emit('filter-reset')"
    />

    <div
      ref="wrapper"
      class="table-wrapper"
    >
      <table
        class="table"
        :class="{ 'table--striped': striped, 'table--hoverable': hoverable }"
      >
        <thead
          class="table--sticky-header"
        >
          <tr>
            <th
              v-if="selectable"
              class="table-col--checkbox"
            >
              <input
                type="checkbox"
                :checked="allSelected"
                class="checkbox__input"
                aria-label="تحديد كل الصفوف الظاهرة"
                @change="$emit('toggle-all', !allSelected, safeItems.map(item => item.id))"
              >
            </th>
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              v-auto-title
              :aria-sort="col.sortKey ? (sortBy === col.sortKey ? sortOrder === 'asc' ? 'ascending' : 'descending' : 'none') : undefined"
              :style="col.style"
              :class="[
                col.key && hideColumns.includes(col.key) ? 'table-col--hide-mobile' : ''
              ]"
            >
              <button v-if="col.sortKey" type="button" class="btn btn--ghost btn--sm" @click="$emit('sort', col.sortKey)">{{ col.label }} {{ sortBy === col.sortKey ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</button>
              <span v-else>{{ col.label }}</span>
            </th>
            <th
              v-if="slots.actions"
              class="table-col--actions"
            >
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="totalColumns">
              <SkeletonLoader
                type="table-row"
                :count="skeletonRows"
              />
            </td>
          </tr>
          <tr v-else-if="!safeItems.length">
            <td :colspan="totalColumns">
              <EmptyState
                :type="emptyType"
                :title="emptyTitle"
                :description="emptyDescription"
                :action-text="emptyActionText"
                :action-url="emptyActionUrl"
              />
            </td>
          </tr>
          <tr
            v-for="item in safeItems"
            :key="item.id"
            :class="{
              'clickable-row': clickableRows,
              'table-row--selected': selectedId === item.id
            }"
            :tabindex="clickableRows ? 0 : undefined"
            @click="activateRow($event, item)"
            @keydown.enter="activateRow($event, item)"
            @keydown.space="activateRow($event, item)"
          >
            <td
              v-if="selectable"
              class="table-col--checkbox"
              @click.stop
            >
              <input
                type="checkbox"
                :checked="isSelected(item.id)"
                class="checkbox__input"
                :aria-label="`تحديد الصف ${item.id}`"
                @change="$emit('toggle-item', item.id)"
              >
            </td>
            <td
              v-for="col in visibleColumns"
              :key="col.key"
              :data-label="col.label"
              :class="col.key && hideColumns.includes(col.key) ? 'table-col--hide-mobile' : ''"
            >
              <slot
                :name="col.key"
                :item="item"
              >
                {{ item[col.key] }}
              </slot>
            </td>
            <td
              v-if="slots.actions"
              class="table-col--actions"
              @click.stop
            >
              <slot
                name="actions"
                :item="item"
              />
            </td>
          </tr>
          <tr v-if="loadingMore">
            <td
              :colspan="totalColumns"
              class="text-center py-2"
            >
              <Spinner size="sm" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useSlots, getCurrentInstance, watch } from 'vue'

import { useAuthStore } from '@/features/auth/stores/auth'
import SkeletonLoader from '../common/SkeletonLoader.vue'
import Spinner from '../common/Spinner.vue'
import EmptyState from './EmptyState.vue'
import FilterBar from './FilterBar.vue'

const props = defineProps({
  preferenceKey: { type: String, default: '' },
  sortBy: { type: String, default: '' },
  sortOrder: { type: String, default: 'desc' },
  columns: { type: Array, required: true },
  items: { type: Array, default: () => [] },
  loading: Boolean,
  loadingMore: Boolean,
  selectable: Boolean,
  selectedIds: { type: [Array, Set], default: () => [] },
  selectedId: { type: [Number, String], default: null },
  skeletonRows: { type: Number, default: 3 },
  emptyType: { type: String, default: 'default' },
  emptyTitle: { type: String, default: '' },
  emptyDescription: { type: String, default: '' },
  emptyActionText: { type: String, default: '' },
  emptyActionUrl: { type: [String, Object], default: '' },
  filters: { type: Array, default: null },
  filterValues: { type: Object, default: () => ({}) },
  striped: { type: Boolean, default: true },
  hoverable: { type: Boolean, default: true },
  hideColumns: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'sort', 'row-click', 'toggle-all', 'toggle-item',
  'update:filterValues', 'filter-apply', 'filter-reset'
])
const auth = useAuthStore()
const hidden = ref([])
const storageKey = computed(() => auth.user?.id && props.preferenceKey ? `clinic:table-columns:${auth.user.id}:${props.preferenceKey}` : null)
watch(() => [storageKey.value, props.columns.map(column => column.key).join('|')], () => {
  try { const value = JSON.parse(storageKey.value && localStorage.getItem(storageKey.value)); hidden.value = Array.isArray(value) ? value.filter(key => props.columns.some(column => column.key === key) && key !== props.columns[0]?.key) : [] } catch { hidden.value = [] }
}, { immediate: true })
const visibleColumns = computed(() => props.columns.filter(column => !hidden.value.includes(column.key)))
function saveColumns() { try { if (storageKey.value) localStorage.setItem(storageKey.value, JSON.stringify(hidden.value)) } catch { /* View remains usable. */ } }
function toggleColumn(key) { if (key === props.columns[0]?.key) return; hidden.value = hidden.value.includes(key) ? hidden.value.filter(item => item !== key) : [...hidden.value, key]; saveColumns() }
function restoreColumns() { hidden.value = []; saveColumns() }
const slots = useSlots()
const instance = getCurrentInstance()
const clickableRows = computed(() => Boolean(instance.vnode.props?.onRowClick || instance.vnode.props?.['onRow-click']))
function activateRow(event, item) {
  if (!clickableRows.value || event.target.closest('a,button,input,select,textarea,[role=button]')) return
  if (event.type === 'keydown') event.preventDefault()
  emit('row-click', item)
}

const wrapper = ref(null)

const safeItems = computed(() => props.items || [])

const totalColumns = computed(() => {
  let count = visibleColumns.value.length
  if (props.selectable) count++
  if (slots.actions) count++
  return count
})

const allSelected = computed(() => {
  return safeItems.value.length > 0 && safeItems.value.every(item => isSelected(item.id))
})

function isSelected(id) {
  return props.selectedIds instanceof Set ? props.selectedIds.has(id) : props.selectedIds.includes(id)
}

function onFilterUpdate(newFilters) {
  emit('update:filterValues', newFilters)
}

function updateScrollClasses() {
  const el = wrapper.value
  if (!el) return
  const rtl = getComputedStyle(el).direction === 'rtl'
  const offset = Math.abs(el.scrollLeft)
  const remaining = el.scrollWidth - el.clientWidth - offset
  const hasLeftScroll = rtl ? remaining > 2 : offset > 2
  const hasRightScroll = rtl ? offset > 2 : remaining > 2
  hasLeftScroll ? el.classList.add('scrollable-left') : el.classList.remove('scrollable-left')
  hasRightScroll ? el.classList.add('scrollable-right') : el.classList.remove('scrollable-right')
}

onMounted(() => {
  updateScrollClasses()
  wrapper.value?.addEventListener('scroll', updateScrollClasses, { passive: true })
})
onBeforeUnmount(() => {
  wrapper.value?.removeEventListener('scroll', updateScrollClasses)
})
</script>
