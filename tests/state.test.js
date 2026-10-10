import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope, ref, nextTick } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useNotificationStore } from '@/features/notifications/stores/notifications'
import { useSelectionStore } from '@/stores/selection'
import { useConfirmStore } from '@/stores/confirm'
import { createCrudStore } from '@/stores/crudStoreFactory'
import { useFormDraft, clearAllFormDrafts } from '@/composables/useFormDraft'
import { usePagination } from '@/composables/usePagination'
import { useSearch } from '@/composables/useSearch'
import { fetchMeGuard, authGuard, permissionGuard } from '@/router/guards'
import { installRuntime, respond, fail, requests, deferred, flush } from './helpers/runtime.js'
installRuntime()

test('auth permissions require a session and explicit grants outside admin', () => {
  const auth = useAuthStore()
  assert.equal(auth.can('view_patients'), false)
  auth.user = { id: 1, role: 'doctor', permissions: ['view_patients'] }
  assert.equal(auth.can('view_patients'), true)
  assert.equal(auth.can('manage_users'), false)
  auth.user.role = 'admin'
  assert.equal(auth.can('manage_users'), true)
})
test('fetchMe checks once unless forced', async () => {
  respond({ data: { user: { id: 1, role: 'doctor' } } })
  const auth = useAuthStore()
  await auth.fetchMe()
  await auth.fetchMe()
  assert.equal(requests.length, 1)
  await auth.fetchMe({ force: true })
  assert.equal(requests.length, 2)
})
test('temporary network failure retains established auth; 401 clears it', async () => {
  const auth = useAuthStore()
  auth.user = { id: 1, role: 'doctor' }
  fail(null)
  await auth.fetchMe({ force: true })
  assert.equal(auth.user.id, 1)
  fail(401)
  await auth.fetchMe({ force: true })
  assert.equal(auth.user, null)
  assert.equal(auth.loading, false)
})
test('logout clears identity even when the request fails', async t => {
  t.mock.method(console, 'warn', () => {})
  const auth = useAuthStore()
  auth.user = { id: 1 }
  fail(null)
  await auth.logout()
  assert.equal(auth.isAuthenticated, false)
  assert.equal(auth.sessionChecked, true)
})
test('route guards redirect guests and already authenticated users', async () => {
  const calls = []
  const next = value => calls.push(value)
  await authGuard({ meta: { requiresAuth: true } }, {}, next)
  assert.deepEqual(calls.pop(), { name: 'Login' })
  useAuthStore().user = { id: 1, role: 'doctor' }
  await authGuard({ meta: { guestOnly: true } }, {}, next)
  assert.deepEqual(calls.pop(), { name: 'Dashboard' })
})
test('permission and role guards enforce route metadata', async () => {
  useAuthStore().user = { id: 1, role: 'doctor', permissions: ['view_patients'] }
  let destination
  await permissionGuard({ meta: { permission: 'manage_users' } }, {}, value => { destination = value })
  assert.equal(destination.name, 'ErrorPage')
  await permissionGuard({ meta: { role: 'admin' } }, {}, value => { destination = value })
  assert.equal(destination.name, 'ErrorPage')
  await permissionGuard({ meta: { permission: 'view_patients' } }, {}, value => { destination = value })
  assert.equal(destination, undefined)
})
test('session fetch guard calls backend only when route needs session', async () => {
  respond({ data: { user: null } })
  await fetchMeGuard({ meta: {} }, {}, () => {})
  assert.equal(requests.length, 0)
  await fetchMeGuard({ meta: { requiresAuth: true } }, {}, () => {})
  assert.equal(requests.length, 1)
})
test('selection toggles and bulk reset preserve reactive array identity', () => {
  const store = useSelectionStore()
  const identity = store.selectedIds
  store.toggle(1)
  store.toggle(1)
  assert.equal(store.count(), 0)
  store.selectAll([1, 2])
  assert.equal(store.isSelected(2), true)
  store.clearAll()
  assert.equal(store.selectedIds, identity)
  assert.equal(store.count(), 0)
})
test('confirmation queue resolves independently and in order', async () => {
  const store = useConfirmStore()
  const one = store.confirm('First')
  const two = store.confirm('Second', { input: { type: 'text' } })
  assert.equal(store.active.message, 'First')
  store.onCancel()
  assert.equal(await one, false)
  assert.equal(store.active.message, 'Second')
  store.onConfirm('RESTORE CLINIC')
  assert.equal(await two, 'RESTORE CLINIC')
  assert.equal(store.active, null)
})
test('CRUD store updates list and current record only after successful response', async () => {
  const useStore = createCrudStore('suite-crud', {
    fetchAll: async () => ({ data: { data: { items: [{ id: 1, version: 1 }] } } }),
    fetchOne: async id => ({ data: { data: { id, version: 1 } } }),
    create: async payload => ({ data: { id: 2, ...payload } }),
    update: async (id, payload) => ({ data: { id, ...payload } }),
    remove: async () => {},
  })
  const store = useStore()
  await store.fetchAll()
  await store.fetchOne(1)
  await store.update(1, { version: 2 })
  assert.equal(store.items[0].version, 2)
  assert.equal(store.current.version, 2)
  await store.create({ version: 1 })
  assert.equal(store.items.length, 2)
  await store.remove(1)
  assert.equal(store.items.length, 1)
  assert.equal(store.current, null)
})
test('CRUD store exposes failures without discarding existing data', async () => {
  const failure = new Error('Synthetic failure')
  const store = createCrudStore('suite-crud-failure', { fetchAll: async () => { throw failure } })()
  store.items = [{ id: 1 }]
  await assert.rejects(store.fetchAll(), failure)
  assert.equal(store.error, failure.message)
  assert.equal(store.loading, false)
  assert.deepEqual(store.items, [{ id: 1 }])
})
test('draft saving pauses during hydration and persists only allowed fields in memory', async () => {
  clearAllFormDrafts()
  const scope = effectScope()
  const draft = scope.run(() => useFormDraft({ safeDraftFields: ['visit_date'] }))
  draft.draft.value = { visit_date: '2026-01-01', main_complaints: 'Synthetic private text' }
  await nextTick()
  assert.equal(draft.restoreDraftToForm(), null)
  draft.resumeDraft()
  assert.deepEqual(draft.restoreDraftToForm(), { visit_date: '2026-01-01' })
  assert.equal(localStorage.length, 0)
  assert.equal(draft.restoreDraftToForm(), null)
  scope.stop()
})
test('logout clears memory drafts across routes', async () => {
  const scope = effectScope()
  const draft = scope.run(() => useFormDraft())
  draft.draft.value = { visit_date: '2026-01-01' }
  draft.resumeDraft()
  respond()
  await useAuthStore().logout()
  assert.equal(draft.restoreDraftToForm(), null)
  scope.stop()
})
test('cursor pagination appends pages and stops at the end', async () => {
  const calls = []
  const pages = [
    { data: { data: { items: [{ id: 1 }], meta: { next_cursor: 'opaque', has_more: true, total: 2 } } } },
    { data: [{ id: 2 }], hasMore: false, nextCursor: null },
  ]
  const pagination = usePagination({ perPage: 1, fetchFn: async args => { calls.push(args); return pages.shift() } })
  await pagination.refresh()
  await pagination.loadNext()
  await pagination.loadNext()
  assert.deepEqual(pagination.items.value, [{ id: 1 }, { id: 2 }])
  assert.equal(calls.length, 2)
  assert.equal(calls[1].cursor, 'opaque')
  assert.equal(calls[1].limit, 1)
})
test('failed pagination retains data and resets loading state', async () => {
  let failed = false
  const pagination = usePagination({ fetchFn: async () => { if (failed) throw new Error('Offline'); return { data: [{ id: 1 }] } } })
  await pagination.refresh()
  failed = true
  await pagination.refresh()
  assert.equal(pagination.items.value.length, 1)
  assert.equal(pagination.error.value.message, 'Offline')
  assert.equal(pagination.loading.value, false)
})
test('array pagination clamps boundaries and reacts to items', () => {
  const items = ref([1, 2, 3])
  const pagination = usePagination({ mode: 'array', perPage: 2, items })
  pagination.go(99)
  assert.deepEqual(pagination.items.value, [3])
  pagination.next()
  assert.equal(pagination.currentPage.value, 2)
  pagination.go(-1)
  assert.equal(pagination.currentPage.value, 1)
  items.value.push(4, 5)
  assert.equal(pagination.totalPages.value, 3)
})
test('search ignores older results after a newer search begins', async () => {
  const old = deferred(), recent = deferred()
  const search = useSearch(query => query === 'old' ? old.promise : recent.promise, { delay: 0 })
  search.onInput('old')
  search.onInput('new')
  recent.resolve(['new'])
  await flush()
  old.resolve(['old'])
  await flush()
  assert.deepEqual(search.results.value, ['new'])
})
test('clearing search invalidates an in-flight result', async () => {
  const pending = deferred()
  const search = useSearch(() => pending.promise, { delay: 0 })
  search.onInput('synthetic')
  search.clear()
  pending.resolve(['stale'])
  await flush()
  assert.deepEqual(search.results.value, [])
})
test('notification mutations keep unread count aligned with actual unread rows', async () => {
  respond()
  const store = useNotificationStore()
  store.notifications = [{ id: 1, is_read: false }, { id: 2, is_read: false }]
  store.unreadCount = 2
  await store.markRead(1)
  await store.markRead(1)
  assert.equal(store.unreadCount, 1)
  await store.deleteNotification(2)
  assert.equal(store.unreadCount, 0)
  store.stopPolling()
})

test('session restore rejects anonymous-looking user payloads', async () => {
  respond({ data: { user: { id: null, username: '', permissions: [] } } })
  const auth = useAuthStore()
  await auth.fetchMe()
  assert.equal(auth.isAuthenticated, false)
  assert.equal(auth.sessionChecked, true)
})
