import { normalizeCursorResponse } from '@/utils/cursorResponse'
import { calculateAge } from '@/utils/date'
import { formatDisplayValue } from '@/utils/formatters'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createLRUCache } from '@/utils/lruCache'
import { validateNationalId, validatePhone, normalizePhone, validateSupervisorId, isPasswordStrong } from '@/utils/validators'
import { fullName } from '@/utils/normalize'
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

for (const [name, response] of [
  ['axios envelope', { data: { data: { items: [1], meta: { total: 8, next_cursor: 'opaque', has_more: true } } } }],
  ['unwrapped envelope', { data: { items: [1], meta: { total: 8, next_cursor: 'opaque', has_more: true } } }],
  ['parsed data', { items: [1], meta: { total: 8, next_cursor: 'opaque', has_more: true } }],
]) test(`pagination consumes ${name}`, () => {
  assert.deepEqual(normalizeCursorResponse(response).items, [1])
  assert.deepEqual(normalizeCursorResponse(response), { items: [1], total: 8, nextCursor: 'opaque', hasMore: true })
})
test('pagination safely handles absent data and historical fallback keys', () => {
  assert.deepEqual(normalizeCursorResponse(null).items, [])
  assert.deepEqual(normalizeCursorResponse({ patients: [4] }, { keys: ['patients'] }).items, [4])
  assert.deepEqual(normalizeCursorResponse(null), { items: [], total: undefined, nextCursor: null, hasMore: false })
})
test('unknown birth remains unknown and age uses encounter year', () => {
  assert.equal(calculateAge(null, '2020-06-10'), null)
  assert.equal(calculateAge('2000', '2020-06-10'), 20)
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
test('names tolerate incomplete records without fabricated demographics', () => {
  assert.equal(fullName(null), '')
  assert.equal(fullName({ first_name: 'عربي' }), 'عربي')
})



test('display values retain explicit negatives and zero while distinguishing absence contexts', () => {
  assert.equal(formatDisplayValue(false), 'لا')
  assert.equal(formatDisplayValue(true), 'نعم')
  assert.equal(formatDisplayValue(0), '0')
  assert.equal(formatDisplayValue(null), 'غير معروف')
  assert.equal(formatDisplayValue('', 'غير مسجل'), 'غير مسجل')
  assert.equal(formatDisplayValue(undefined, 'غير منطبق'), 'غير منطبق')
})
