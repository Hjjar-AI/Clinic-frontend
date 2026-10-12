import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import apiClient, { cancelAllPending } from '@/services/apiClient'
import { changeSession, sessionPrincipal, sessionStorePlugin } from '@/services/sessionState'
import { useFormDraft } from '@/composables/useFormDraft'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useUserStore } from '@/features/settings/stores/users'
import { useNotificationStore } from '@/features/notifications/stores/notifications'
import { useConfirmStore } from '@/stores/confirm'
import { useLoadingStore } from '@/stores/loading'
import { persistPlugin } from '@/stores/plugins/persist'
import { authGuard } from '@/router/guards'
import { reportError } from '@/utils/reportError'
import { installRuntime, deferred, respond, requests, flush } from './helpers/runtime.js'
installRuntime()

function delayedHttp() {
  const pending = deferred()
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    const data = await pending.promise
    return { data, headers: {}, status: 200, config }
  }
  return pending
}

test('preserved drafts restore for their owner only and remain absent from browser storage', () => {
  changeSession(1)
  const scope = effectScope()
  const first = scope.run(() => useFormDraft())
  first.draft.value = { visit_date: '2026-10-12', note: 'Synthetic private draft' }
  first.resumeDraft()
  changeSession(null); changeSession(2)
  const other = scope.run(() => useFormDraft())
  assert.equal(other.restoreDraftToForm(), null)
  first.draft.value = { note: 'Late old-account edit' }; first.resumeDraft()
  changeSession(1)
  const owner = scope.run(() => useFormDraft())
  assert.equal(owner.restoreDraftToForm().note, 'Synthetic private draft')
  assert.equal(localStorage.length, 0)
  scope.stop()
})

test('different-account login after timeout removes old drafts', async () => {
  changeSession(1)
  const auth = useAuthStore(); auth.user = { id: 1 }
  const scope = effectScope(), draft = scope.run(() => useFormDraft())
  draft.draft.value = { note: 'Synthetic' }; draft.resumeDraft()
  respond(); await auth.logout({ preserveDrafts: true })
  respond({ data: { user: { id: 2, username: 'second', permissions: [] } } })
  await auth.login('second', 'Synthetic-Password!42')
  assert.equal(sessionPrincipal(), 2)
  changeSession(1)
  assert.equal(scope.run(() => useFormDraft()).restoreDraftToForm(), null)
  scope.stop()
})

test('session teardown resets real setup-store refs, collections and cyclic values', () => {
  const usePrivate = defineStore('session-probe', () => ({ rows: ref([]), map: ref(new Map()), set: ref(new Set()) }))
  const store = usePrivate(); store.rows.push({ id: 1 }); store.map.set(1, 'Synthetic'); store.set.add(1)
  changeSession(2)
  assert.deepEqual(store.rows, []); assert.equal(store.map.size, 0); assert.equal(store.set.size, 0)
  const cyclic = {}; cyclic.self = cyclic
  const cyclicStore = { $id: 'cycle', $state: { value: ref(cyclic) }, $patch: callback => callback(cyclicStore.$state), $dispose() {} }
  sessionStorePlugin({ store: cyclicStore }); changeSession(3)
  assert.equal(cyclicStore.$state.value.self, cyclicStore.$state.value)
  cyclicStore.$dispose()
})

test('account teardown cancels all queued confirmations and resolves their promises', async () => {
  const confirm = useConfirmStore(), one = confirm.confirm('Synthetic one'), two = confirm.confirm('Synthetic two')
  changeSession(2)
  assert.deepEqual(await Promise.all([one, two]), [false, false])
  assert.equal(confirm.active, null)
})

test('a late account response cannot publish data or observed resource versions', async () => {
  changeSession(1)
  const pending = delayedHttp(), read = apiClient.get('/patients/777/').catch(error => error)
  await flush(); changeSession(2); pending.resolve({ data: { id: 777, version: 9 } })
  assert.ok(axios.isCancel(await read))
  respond(); await apiClient.patch('/patients/777/', { occupation: 'Synthetic' })
  assert.equal(requests.at(-1).headers.get('If-Match'), undefined)
})

test('navigation leaves a dispatched mutation and its operation key intact', async () => {
  const pending = delayedHttp(), write = apiClient.post('/tasks/', { title: 'Synthetic dispatched write' })
  await flush(); const key = requests[0].headers.get('X-Idempotency-Key'); cancelAllPending()
  assert.equal(requests[0].cancelToken.reason, undefined)
  pending.resolve({ data: { id: 4 } }); await write
  assert.equal(requests[0].headers.get('X-Idempotency-Key'), key)
})

test('uncertain cancellation retains retry identity only within its account', async () => {
  changeSession(1)
  const pending = delayedHttp(), source = axios.CancelToken.source()
  const first = apiClient.post('/tasks/', { title: 'Synthetic uncertain' }, { cancelToken: source.token }).catch(error => error)
  await flush(); const key = requests[0].headers.get('X-Idempotency-Key')
  source.cancel('Synthetic cancellation'); pending.resolve({}); assert.ok(axios.isCancel(await first))
  respond(); await apiClient.post('/tasks/', { title: 'Synthetic uncertain' })
  assert.equal(requests.at(-1).headers.get('X-Idempotency-Key'), key)
  changeSession(2); await apiClient.post('/tasks/', { title: 'Synthetic uncertain' })
  assert.notEqual(requests.at(-1).headers.get('X-Idempotency-Key'), key)
})

test('background reads never block global loading and mutations clear it after cancellation', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let pending = delayedHttp(), read = apiClient.get('/dashboard/')
  await flush(); t.mock.timers.tick(250); assert.equal(useLoadingStore().isLoading, false)
  pending.resolve({}); await read
  pending = delayedHttp(); const source = axios.CancelToken.source()
  const write = apiClient.post('/tasks/', { title: 'Synthetic' }, { cancelToken: source.token }).catch(error => error)
  await flush(); t.mock.timers.tick(250); assert.equal(useLoadingStore().isLoading, true)
  source.cancel('Synthetic'); pending.resolve({}); await write
  assert.equal(useLoadingStore().isLoading, false)
})

test('doctor cache loaded flag resets between principals', async () => {
  respond({ data: [{ id: 1 }] }); const users = useUserStore(); await users.fetchDoctors()
  changeSession(2); respond({ data: [{ id: 2 }] }); await users.fetchDoctors()
  assert.deepEqual(users.doctors, [{ id: 2 }])
})

test('an old notification poll cannot repopulate or start a fallback for a new principal', async () => {
  const auth = useAuthStore(); auth.user = { id: 1 }
  const notifications = useNotificationStore(), pending = delayedHttp(), poll = notifications.fetchAllPersistent()
  await flush(); changeSession(2); const count = requests.length
  pending.resolve({ data: { items: [{ id: 9 }], meta: { unread_count: 1 } } }); await poll
  assert.deepEqual(notifications.notifications, []); assert.equal(requests.length, count)
})

test('stale fetchMe completion cannot replace a newer account or its check state', async () => {
  changeSession(1); const auth = useAuthStore(); auth.user = { id: 1 }
  const pending = delayedHttp(), me = auth.fetchMe({ force: true })
  await flush(); changeSession(2); auth.user = { id: 2 }; auth.sessionChecked = false
  pending.resolve({ data: { user: { id: 1 } } }); await me
  assert.equal(auth.user.id, 2); assert.equal(auth.sessionChecked, false)
})

test('force-password routing permits the password route and rejects clinical navigation', async () => {
  useAuthStore().user = { id: 1, force_password_change: true }; let destination
  await authGuard({ name: 'PatientsList', meta: { requiresAuth: true } }, {}, next => { destination = next })
  assert.deepEqual(destination, { name: 'ChangePassword' })
  await authGuard({ name: 'ChangePassword', meta: { requiresAuth: true } }, {}, next => { destination = next })
  assert.equal(destination, undefined)
})

test('preference persistence uses plugin options and excludes undeclared fields', () => {
  localStorage.setItem('safe-pref', JSON.stringify({ density: 'compact', private: 'Synthetic secret' }))
  const state = { density: 'normal', private: '' }, store = { $id: 'ui', ...state, $subscribe(fn) { this.save = fn } }
  persistPlugin({ store, options: { persist: { key: 'safe-pref', paths: ['density'] } } })
  assert.equal(store.density, 'compact'); assert.equal(store.private, '')
  store.save({}, { density: 'wide', private: 'Synthetic secret' })
  assert.deepEqual(JSON.parse(localStorage.getItem('safe-pref')), { density: 'wide' })
})

test('console diagnostics never include credentials, headers or clinical exception messages', t => {
  const logs = []; t.mock.method(console, 'error', (...args) => logs.push(args))
  reportError('synthetic-operation', { message: 'Synthetic clinical text', response: { status: 500 }, config: { data: { password: 'Synthetic secret' }, headers: { Cookie: 'Synthetic session' } } })
  assert.deepEqual(logs, [['[Clinic error]', { operation: 'synthetic-operation', status: 500 }]])
})
