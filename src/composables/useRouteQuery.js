import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * Sync a reactive value with a query parameter in the URL.
 * Uses replace by default to avoid polluting browser history.
 *
 * @param {string} key          – query parameter name
 * @param {any}    defaultValue  – default value if not present
 * @param {Object} options       – { replace: true } to use replace instead of push (default true)
 * @returns {import('vue').Ref}
 */
export function useRouteQuery(key, defaultValue = '', options = { replace: true }) {
  const route = useRoute()
  const router = useRouter()
  const queryValue = ref(route.query[key] ?? defaultValue)

  // When the URL changes externally (back/forward), update the ref
  watch(() => route.query[key], (newVal) => {
    if (newVal !== undefined) {
      queryValue.value = newVal
    } else {
      queryValue.value = defaultValue
    }
  })

  // When the ref changes, update the URL
  watch(queryValue, (newVal) => {
    if (newVal === defaultValue || newVal === '' || newVal === null) {
      const rest = { ...route.query }
      delete rest[key]
      if (options.replace) {
        router.replace({ query: rest })
      } else {
        router.push({ query: rest })
      }
    } else {
      const query = { ...route.query, [key]: newVal }
      if (options.replace) {
        router.replace({ query })
      } else {
        router.push({ query })
      }
    }
  })

  return queryValue
}
