import { computed, ref, toValue, watch } from 'vue'

import { useAuthStore } from '@/features/auth/stores/auth'

/** Account/browser preferences only; fixed identity columns are always visible. */
export function useTableColumns(columns, preferenceKey) {
  const auth = useAuthStore()
  const hidden = ref([])
  const all = computed(() => toValue(columns))
  const storageKey = computed(() =>
    auth.user?.id && toValue(preferenceKey)
      ? `clinic:table-columns:${auth.user.id}:${toValue(preferenceKey)}`
      : null,
  )
  const fixed = (column) => column.fixed || column.key === all.value[0]?.key
  watch(
    () => [storageKey.value, all.value.map((column) => column.key).join('|')],
    () => {
      try {
        const value = JSON.parse(
          storageKey.value && localStorage.getItem(storageKey.value),
        )
        hidden.value = Array.isArray(value)
          ? value.filter((key) =>
              all.value.some((column) => column.key === key && !fixed(column)),
            )
          : []
      } catch {
        hidden.value = []
      }
    },
    { immediate: true, flush: 'sync' },
  )
  const visibleKeys = computed({
    get: () =>
      all.value
        .filter((column) => fixed(column) || !hidden.value.includes(column.key))
        .map((column) => column.key),
    set: (keys) => {
      hidden.value = all.value
        .filter((column) => !fixed(column) && !keys.includes(column.key))
        .map((column) => column.key)
      try {
        if (storageKey.value)
          localStorage.setItem(storageKey.value, JSON.stringify(hidden.value))
      } catch {
        /* Preferences are optional. */
      }
    },
  })
  return { visibleKeys }
}
