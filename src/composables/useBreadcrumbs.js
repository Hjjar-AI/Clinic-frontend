import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useBreadcrumbs() {
  const route = useRoute()

  const breadcrumbs = computed(() => {
    if (route.meta.breadcrumb) return route.meta.breadcrumb
    return route.matched
      .filter(r => r.meta?.title)
      .map(r => ({ label: r.meta.title, to: r.path }))
  })

  return { breadcrumbs }
}