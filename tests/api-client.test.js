import test from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import apiClient, { unwrapResponse, cancelPendingRequests, cancelAllPending } from '@/services/apiClient'
import { on, API_EVENTS } from '@/services/apiEvents'
import { useLoadingStore } from '@/stores/loading'
import { installRuntime, respond, fail, requests, deferred, flush } from './helpers/runtime.js'
installRuntime()

for (const value of [0, false, '', [], { id: 1 }]) {
  test(`unwrapResponse preserves ${JSON.stringify(value)}`, () => {
    assert.deepEqual(unwrapResponse({ data: { data: value } }), value)
  })
}
test('client keeps same-origin credentials and JSON response headers', () => {
  assert.equal(apiClient.defaults.baseURL, '/api/v1')
  assert.equal(apiClient.defaults.withCredentials, true)
  assert.equal(apiClient.defaults.timeout, 15000)
})
test('normalizes slash and pagination without losing query string', async () => {
  respond()
  await apiClient.get('/patients?search=synthetic', { params: { limit: 3 } })
  assert.equal(requests[0].url, '/patients/?search=synthetic')
  assert.deepEqual(requests[0].params, { per_page: 3 })
})
test('explicit per_page takes precedence over limit', async () => {
  respond()
  await apiClient.get('/patients/', { params: { limit: 3, per_page: 4 } })
  assert.equal(requests[0].params.per_page, 4)
})
test('JSON filenames retain their extension', async () => {
  respond()
  await apiClient.get('/backup.json')
  assert.equal(requests[0].url, '/backup.json')
})
test('CSRF is attached only to unsafe requests', async () => {
  document.cookie = 'other=value; csrftoken=synthetic-csrf'
  respond()
  await apiClient.get('/patients/')
  await apiClient.post('/patients/', { first_name: 'Synthetic' })
  assert.equal(requests[0].headers.get('X-CSRFToken'), undefined)
  assert.equal(requests[1].headers.get('X-CSRFToken'), 'synthetic-csrf')
  assert.match(requests[1].headers.get('X-Idempotency-Key'), /^idem-/)
})
test('caller-provided idempotency key and cancellation token survive', async () => {
  const source = axios.CancelToken.source()
  respond()
  await apiClient.post('/tasks/', { title: 'Synthetic' }, { idempotencyKey: 'suite-operation', cancelToken: source.token })
  assert.equal(requests[0].headers.get('X-Idempotency-Key'), 'suite-operation')
  assert.equal(requests[0].cancelToken, source.token)
})
for (const [resource, id] of [['patients', 101], ['visits', 102], ['appointments', 103], ['tasks', 104], ['billing', 105], ['options/diagnoses', 106], ['auth/users', 107], ['scales', 108], ['templates', 109]]) {
  test(`observed ${resource} version becomes If-Match`, async () => {
    respond({ data: { items: [{ id, version: 7 }] } })
    await apiClient.get(`/${resource}/`)
    respond()
    await apiClient.patch(`/${resource}/${id}/`, { notes: 'Changed' })
    assert.equal(requests.at(-1).headers.get('If-Match'), '7')
  })
}
test('explicit opening version overrides a newer observed version', async () => {
  respond({ data: { id: 201, version: 9 } })
  await apiClient.get('/patients/201/')
  respond()
  await apiClient.patch('/patients/201/', { version: 2, notes: 'Stale form' })
  assert.equal(requests.at(-1).headers.get('If-Match'), '2')
})
test('caller-provided If-Match takes precedence', async () => {
  respond()
  await apiClient.patch('/patients/202/', { version: 2 }, { headers: { 'If-Match': '"3"' } })
  assert.equal(requests.at(-1).headers.get('If-Match'), '"3"')
})
test('nested document versions do not overwrite patient versions', async () => {
  respond({ data: { id: 301, version: 3 } })
  await apiClient.get('/patients/301/')
  respond({ data: [{ id: 7, version: 8 }] })
  await apiClient.get('/patients/301/documents/')
  respond()
  await apiClient.patch('/patients/301/', {})
  assert.equal(requests.at(-1).headers.get('If-Match'), '3')
  await apiClient.patch('/patients/301/documents/7/', {})
  assert.equal(requests.at(-1).headers.get('If-Match'), '8')
})
test('parent version response header is retained for longitudinal records', async () => {
  respond({ data: { record: { id: 1 }, version: 5 } }, { 'x-resource-version': '5' })
  await apiClient.post('/patients/302/records/', { kind: 'contacts', fields: { name: 'Synthetic' }, version: 4 })
  respond()
  await apiClient.patch('/patients/302/', {})
  assert.equal(requests.at(-1).headers.get('If-Match'), '5')
})
test('nested patient visit list updates visit registry', async () => {
  respond({ data: { items: [{ id: 401, version: 6 }] } })
  await apiClient.get('/patients/10/visits/')
  respond()
  await apiClient.put('/visits/401/', {})
  assert.equal(requests.at(-1).headers.get('If-Match'), '6')
})
test('uncertain network retry preserves operation key, successful next operation gets a new key', async () => {
  fail(null)
  await assert.rejects(apiClient.post('/tasks/', { title: 'Retry synthetic' }))
  const firstKey = requests[0].headers.get('X-Idempotency-Key')
  respond()
  await apiClient.post('/tasks/', { title: 'Retry synthetic' })
  assert.equal(requests.at(-1).headers.get('X-Idempotency-Key'), firstKey)
  await apiClient.post('/tasks/', { title: 'Retry synthetic' })
  assert.notEqual(requests.at(-1).headers.get('X-Idempotency-Key'), firstKey)
})
test('request_in_progress retry retains key and does not emit stale-version conflict', async () => {
  let count = 0
  const off = on(API_EVENTS.CONFLICT, () => count++)
  fail(409, { error: { code: 'request_in_progress' } })
  await assert.rejects(apiClient.post('/tasks/', { title: 'In progress synthetic' }))
  const key = requests[0].headers.get('X-Idempotency-Key')
  respond()
  await apiClient.post('/tasks/', { title: 'In progress synthetic' })
  assert.equal(requests.at(-1).headers.get('X-Idempotency-Key'), key)
  assert.equal(count, 0)
  off()
})
test('stale version emits conflict event', async () => {
  let conflict
  const off = on(API_EVENTS.CONFLICT, error => { conflict = error })
  fail(409, { error: { code: 'conflict', message: 'Refresh required' } })
  await assert.rejects(apiClient.patch('/patients/999/', { version: 1 }))
  assert.equal(conflict.response.status, 409)
  off()
})
test('structured blob download errors are decoded', async () => {
  fail(400, new Blob([JSON.stringify({ error: { message: 'Synthetic download error' } })], { type: 'application/json' }))
  await assert.rejects(apiClient.get('/exports/patients/1/pdf/', { responseType: 'blob' }), error => {
    assert.equal(error.response.data.error.message, 'Synthetic download error')
    return true
  })
})
test('permission update header emits semantic event', async () => {
  let count = 0
  const off = on(API_EVENTS.PERMISSIONS_UPDATED, () => count++)
  respond({}, { 'x-permissions-updated': 'true' })
  await apiClient.get('/system/config/')
  assert.equal(count, 1)
  off()
})
test('rapid duplicate mutation cancels the second while keeping first alive', async () => {
  const pending = deferred()
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    await pending.promise
    return { status: 200, data: {}, headers: {}, config }
  }
  const first = apiClient.post('/tasks/', { title: 'Duplicate synthetic' })
  await flush()
  await assert.rejects(apiClient.post('/tasks/', { title: 'Duplicate synthetic' }), axios.isCancel)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].cancelToken.reason, undefined)
  pending.resolve()
  await first
})
test('navigation cancels pending GETs without cancelling persistent polling', async () => {
  const pending = deferred()
  apiClient.defaults.adapter = async config => {
    requests.push(config)
    await pending.promise
    return { status: 200, data: {}, headers: {}, config }
  }
  const get = apiClient.get('/patients/').catch(error => error)
  const polling = apiClient.get('/notifications/', { __persistent: true })
  await flush()
  cancelPendingRequests('/patients/')
  assert.ok(requests[0].cancelToken.reason)
  assert.equal(requests[1].cancelToken.reason, undefined)
  cancelAllPending()
  pending.resolve()
  assert.ok(axios.isCancel(await get))
  await polling
})
test('loading starts after delay and clears on completed request', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const pending = deferred()
  apiClient.defaults.adapter = async config => {
    await pending.promise
    return { status: 200, data: {}, headers: {}, config }
  }
  const request = apiClient.post('/tasks/', { title: 'Synthetic foreground mutation' })
  await flush()
  assert.equal(useLoadingStore().isLoading, false)
  t.mock.timers.tick(201)
  assert.equal(useLoadingStore().isLoading, true)
  pending.resolve()
  await request
  assert.equal(useLoadingStore().isLoading, false)
})
