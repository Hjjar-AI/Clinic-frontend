import { computed } from 'vue'

import { useRouteQuery } from '@/composables/useRouteQuery'

export function useRouteFilters(defaults, mapping = {}) {
  const fields = Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [
      key,
      useRouteQuery(mapping[key] || key, value),
    ]),
  )
  return computed({
    get: () =>
      Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, value.value]),
      ),
    set: (values) => {
      for (const [key, value] of Object.entries(fields))
        value.value = values[key] || defaults[key]
    },
  })
}
