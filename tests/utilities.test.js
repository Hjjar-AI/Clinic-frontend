import test from 'node:test'
import assert from 'node:assert/strict'
import { createLRUCache } from '@/utils/lruCache'
import { buildQuery, buildSearchQuery } from '@/utils/queryBuilder'
import { extractList, extractMeta } from '@/utils/pagination'
import { calculateAge, getLatestRiskLevel, getRiskLabel, timesOverlap, isAppointmentConflicting } from '@/utils/businessRules'
import { validateNationalId, validatePhone, normalizePhone, validateSupervisorId, isPasswordStrong } from '@/utils/validators'
import { normalizeList, fullName } from '@/utils/normalize'
import { withAsyncState } from '@/utils/asyncStore'
import { installRuntime } from './helpers/runtime.js'
installRuntime()

test('bounded cache evicts least recently used, retaining reads and replacements', () => {
  const cache = createLRUCache(2)
  cache.set('a', 1); cache.set('b', 2)
  assert.equal(cache.get('a'), 1)
  cache.set('c', 3)
  assert.equal(cache.has('b'), false)
  cache.set('a', 4)
  assert.equal(cache.size(), 2)
  assert.deepEqual(cache.entries(), [['c', 3], ['a', 4]])
  cache.delete('c'); cache.clear()
  assert.equal(cache.size(), 0)
})
test('query filters retain false and zero without leaking empty values', () => {
  assert.deepEqual(buildQuery({ filters: { active: false, amount: 0, missing: null, empty: '', absent: undefined }, sort: { sort_by: 'id' }, cursor: 'opaque', limit: 40 }),
    { active: false, amount: 0, sort_by: 'id', sort_order: 'asc', cursor: 'opaque', per_page: 40 })
  assert.deepEqual(buildSearchQuery({ search: 'عربي', filters: { active: true } }), { active: true, per_page: 20, search: 'عربي' })
})
for (const [name, response] of [
  ['axios envelope', { data: { data: { items: [1], meta: { total: 8, next_cursor: 'opaque', has_more: true } } } }],
  ['unwrapped envelope', { data: { items: [1], meta: { total: 8, next_cursor: 'opaque', has_more: true } } }],
  ['parsed data', { items: [1], meta: { total: 8, next_cursor: 'opaque', has_more: true } }],
]) test(`pagination consumes ${name}`, () => {
  assert.deepEqual(extractList(response), [1])
  assert.deepEqual(extractMeta(response), { total: 8, nextCursor: 'opaque', hasMore: true })
})
test('pagination safely handles absent data and historical fallback keys', () => {
  assert.deepEqual(extractList(null), [])
  assert.deepEqual(extractList({ patients: [4] }, 'patients'), [4])
  assert.deepEqual(extractMeta(null), { total: 0, nextCursor: null, hasMore: false })
})
test('unknown birth remains unknown and age uses encounter year', () => {
  assert.equal(calculateAge(null, '2020-06-10'), null)
  assert.equal(calculateAge('2000', '2020-06-10'), 20)
})
test('latest documented risk takes precedence over older high risk', () => {
  assert.equal(getLatestRiskLevel([]), null)
  assert.equal(getLatestRiskLevel([{}, { suicide_risk_level: 'Low' }, { suicide_risk_level: 'High' }]), 'Low')
  assert.equal(getLatestRiskLevel([{ suicide_risk_level: 'Low', violence_risk_level: 'High' }]), 'High')
  assert.equal(getLatestRiskLevel([{ violence_risk_level: 'Moderate' }]), 'Moderate')
  assert.equal(getRiskLabel(null), 'غير محدد')
})
test('appointment conflicts permit adjacent intervals', () => {
  assert.equal(timesOverlap(600, 630, 630, 660), false)
  assert.equal(timesOverlap(600, 640, 630, 660), true)
  assert.equal(isAppointmentConflicting('10:00', 30, [{ start: 630, end: 660 }]), false)
  assert.equal(isAppointmentConflicting('10:00', 45, [{ start: 630, end: 660 }]), true)
})
test('optional national identifiers and phones validate supplied values only', () => {
  assert.equal(validateNationalId(''), true)
  assert.equal(validateNationalId(' 12345678901 '), true)
  assert.equal(validateNationalId('12345abc901'), false)
  assert.equal(validatePhone(''), true)
  assert.equal(validatePhone('123'), false)
  assert.equal(normalizePhone('+963 944 123 456'), '+963944123456')
})
test('optional supervisor accepts integer IDs and rejects fractional/nonpositive IDs', () => {
  for (const value of [null, undefined, '', 12, '12']) assert.equal(validateSupervisorId(value), true)
  for (const value of [0, -1, 1.5, 'bad']) assert.equal(validateSupervisorId(value), false)
})
for (const password of ['short', '123456789', 'password', 'Suite_admin!42']) {
  test(`password rules reject ${password}`, () => assert.equal(isPasswordStrong(password, 'suite_admin'), false))
}
test('password validator accepts long noncommon synthetic values', () => assert.equal(isPasswordStrong('Synthetic-Pass!42', 'suite_admin'), true))
test('names and lists tolerate incomplete records without fabricated demographics', () => {
  assert.equal(fullName(null), '')
  assert.equal(fullName({ first_name: 'عربي' }), 'عربي')
  assert.deepEqual(normalizeList(null, 'items'), [])
  assert.deepEqual(normalizeList({ rows: [1] }, 'rows'), [1])
})
test('async state clears previous errors on retry and success', () => {
  const state = {}; const actions = withAsyncState(state)
  actions.setError('failure'); actions.setLoading()
  assert.deepEqual(state, { loading: true, error: null })
  actions.setSuccess()
  assert.deepEqual(state, { loading: false, error: null })
})
