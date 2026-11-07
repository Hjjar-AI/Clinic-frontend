import { isRef, toRaw } from 'vue'

let generation = 0
let principal = null
const cleanup = new Set()
export const sessionGeneration = () => generation
export const sessionPrincipal = () => principal
export function onSessionChange(callback) {
  cleanup.add(callback)
  return () => cleanup.delete(callback)
}
export function changeSession(owner) {
  principal = owner ?? null
  generation += 1
  for (const callback of cleanup) callback()
}
function copy(value, seen = new WeakMap()) {
  if (isRef(value)) return copy(value.value, seen)
  value = toRaw(value)
  if (!value || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)
  if (value instanceof Date) return new Date(value)
  const result = Array.isArray(value) ? [] : value instanceof Map ? new Map() : value instanceof Set ? new Set() : {}
  seen.set(value, result)
  if (value instanceof Map) for (const [key, item] of value) result.set(key, copy(item, seen))
  else if (value instanceof Set) for (const item of value) result.add(copy(item, seen))
  else for (const [key, item] of Object.entries(value)) result[key] = copy(item, seen)
  return result
}
export function sessionStorePlugin({ store }) {
  if (['auth', 'ui', 'loading', 'constants', 'systemConfig'].includes(store.$id)) return
  const initial = copy(store.$state)
  const remove = onSessionChange(() => store.$patch(state => {
    for (const key of Object.keys(initial)) state[key] = copy(initial[key])
  }))
  const dispose = store.$dispose.bind(store)
  store.$dispose = () => { remove(); dispose() }
}
