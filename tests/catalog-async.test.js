import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope, nextTick } from 'vue'
import apiClient from '@/services/apiClient'
import { changeSession } from '@/services/sessionState'
import { fetchCatalog } from '@/utils/catalogFetch'
import { optionList } from '@/utils/optionList'
import { createLookupStore } from '@/stores/lookupStoreFactory'
import { usePagination } from '@/composables/usePagination'
import { useAnalyticsStore } from '@/features/dashboard/stores/analytics'
import { useDate } from '@/composables/useDate'
import { useTimeSlots } from '@/features/appointments/composables/useTimeSlots'
import { installRuntime, deferred, flush, fail } from './helpers/runtime.js'
installRuntime()

for (const key of ['diagnoses', 'medications', 'scales', 'templates', 'visits', 'appointments']) {
  test(`complete ${key} catalog follows backend cursors beyond its first 200 rows`, async () => {
    const calls = []
    const rows = await fetchCatalog(async params => {
      calls.push(params)
      return { data: { data: { [key]: params.cursor ? [{ id: 201 }] : Array.from({ length: 200 }, (_, id) => ({ id: id + 1 })), meta: { next_cursor: params.cursor ? null : 'next' } } } }
    }, key)
    assert.equal(rows.length, 201); assert.equal(rows.at(-1).id, 201)
    assert.deepEqual(calls, [{ per_page: 200 }, { per_page: 200, cursor: 'next' }])
  })
}

test('catalog rejects malformed and cyclic responses rather than advertising completeness', async () => {
  await assert.rejects(fetchCatalog(async () => ({ unexpected: {} })), /Invalid catalog/)
  await assert.rejects(fetchCatalog(async () => ({ items: [], meta: { next_cursor: 'repeat' } })), /Repeated catalog/)
})

test('lookup loading coalesces and invalidation refreshes the reactive catalog', async () => {
  const first = deferred(), second = deferred(); let calls = 0
  const scope = effectScope(); const lookup = scope.run(() => createLookupStore('synthetic-lookups', async () => (++calls === 1 ? first : second).promise, 'items')())
  const a = lookup.fetch(), b = lookup.fetch(); first.resolve({ items: [{ id: 1 }] }); await Promise.all([a, b]); await nextTick()
  assert.equal(calls, 1); assert.equal(lookup.itemsMap.get(1).id, 1)
  lookup.invalidateAll(); second.resolve({ items: [{ id: 2 }] }); await flush(); await nextTick()
  assert.equal(calls, 2); assert.deepEqual(lookup.items.value, [{ id: 2 }]); assert.equal(lookup.itemsMap.has(1), false)
  scope.stop()
})

test('lookup account change rejects a late full-catalog load', async () => {
  const page = deferred(); const scope = effectScope(); const lookup = scope.run(() => createLookupStore('late-lookups', () => page.promise, 'items')())
  const pending = lookup.fetch(); changeSession(2); page.resolve({ items: [{ id: 7 }] }); await pending
  assert.deepEqual(lookup.items.value, []); scope.stop()
})

test('pagination newer filters supersede old response and old finally cannot hide loading', async () => {
  const old = deferred(), recent = deferred(); let calls = 0
  const scope = effectScope(), pager = scope.run(() => usePagination({ fetchFn: () => (++calls === 1 ? old : recent).promise }))
  const a = pager.refresh(), b = pager.refresh(); old.resolve({ items: [{ id: 'old' }] }); await a
  assert.equal(pager.loading.value, true); assert.deepEqual(pager.items.value, [])
  recent.resolve({ items: [{ id: 'new' }] }); await b
  assert.deepEqual(pager.items.value, [{ id: 'new' }]); scope.stop()
})

test('pagination disposal discards late items', async () => {
  const page = deferred(), scope = effectScope(), pager = scope.run(() => usePagination({ fetchFn: () => page.promise }))
  const pending = pager.refresh(); scope.stop(); page.resolve({ items: [{ id: 1 }] }); await pending
  assert.deepEqual(pager.items.value, [])
})

test('dashboard badge and foreground requests coalesce; latest filters own data', async () => {
  const waiting = []
  apiClient.defaults.adapter = async config => { const request = deferred(); waiting.push(request); return { data: await request.promise, headers: {}, status: 200, config } }
  const store = useAnalyticsStore(), old = store.fetchDashboard('2026-01-01'), duplicate = store.fetchDashboard('2026-01-01', null, { background: true })
  await flush(); assert.equal(waiting.length, 1)
  const latest = store.fetchDashboard('2026-02-01'); await flush()
  waiting[1].resolve({ data: { total_patients: 2 } }); await latest
  waiting[0].resolve({ data: { total_patients: 1 } }); await Promise.all([old, duplicate])
  assert.equal(store.dashboard.total_patients, 2); assert.equal(store.loading, false)
})

test('dashboard failed refresh retains data and propagates failure', async () => {
  const store = useAnalyticsStore(); store.dashboard = { total_patients: 7 }; fail(500)
  await assert.rejects(store.fetchDashboard()); assert.equal(store.dashboard.total_patients, 7)
  assert.ok(store.error); assert.equal(store.loading, false)
})

for (const value of ['2026-02-30', '31/02/2026', '31abc/01/2026', '2026-02-30T10:00:00Z', 'not-a-date']) {
  test(`invalid calendar input ${value} cannot become a valid form date`, () => {
    const date = useDate(); assert.equal(date.parseDate(value), null)
    assert.throws(() => date.normalizeFormDates({ visit_date: value }, ['visit_date']))
  })
}
for (const [value, expected] of [['2026-10-12T09:00:00+03:00', '2026-10-12T06:00:00.000Z'], ['2026-10-12T09:00:00-04:00', '2026-10-12T13:00:00.000Z']]) {
  test(`timestamp ${value} preserves its instant`, () => assert.equal(useDate().parseDate(value).toISOString(), expected))
}
for (const step of [0, -1, Infinity, NaN, 1.5]) test(`time slots reject invalid step ${step}`, () => assert.throws(() => useTimeSlots(8, 9, 0, step)))
test('nondivisible time steps carry minutes without invented hours', () => assert.deepEqual(useTimeSlots(8, 10, 0, 45).timeSlots.value, ['08:00', '08:45', '09:30']))
test('option envelopes expose rows and reject undocumented shapes', () => {
  assert.deepEqual(optionList({ data: { data: { doctors: [{ id: 1 }] } } }), [{ id: 1 }])
  assert.throws(() => optionList({ unexpected: [] }))
})
