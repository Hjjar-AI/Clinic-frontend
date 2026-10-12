import { ref, watch, onScopeDispose } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const queues = new WeakMap()
/** Coalesce same-turn query edits without dropping other fields. */
export function useRouteQuery(key, defaultValue = '', options = { replace: true }) {
  const route = useRoute(), router = useRouter()
  let queue = queues.get(router)
  if (!queue) { queue = { pending: {}, scheduled: false, writing: false, syncers: new Set() }; queues.set(router, queue) }
  const value = ref(route.query[key] ?? defaultValue)
  const synchronize = () => { value.value = route.query[key] ?? defaultValue }
  queue.syncers.add(synchronize)
  onScopeDispose(() => queue.syncers.delete(synchronize))
  watch(() => route.query[key], next => {
    if (!queue.writing && !Object.hasOwn(queue.pending, key)) value.value = next ?? defaultValue
  })
  watch(value, next => {
    if ((route.query[key] ?? defaultValue) === next && !queue.writing) return
    queue.pending[key] = next === defaultValue || next == null || next === '' ? undefined : next
    if (queue.scheduled) return
    queue.scheduled = true
    const path = route.path
    Promise.resolve().then(async () => {
      try {
        while (Object.keys(queue.pending).length && path === route.path) {
          const pending = queue.pending; queue.pending = {}
          const query = { ...route.query }
          for (const [name, item] of Object.entries(pending)) {
            if (item === undefined) delete query[name]; else query[name] = item
          }
          queue.writing = true
          await router[options.replace === false ? 'push' : 'replace']({ query })
        }
      } finally { queue.writing = false; queue.scheduled = false; queue.pending = {}; for (const sync of queue.syncers) sync() }
    }).catch(() => {})
  }, { flush: 'sync' })
  return value
}
