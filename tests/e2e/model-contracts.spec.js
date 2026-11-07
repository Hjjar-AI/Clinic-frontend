import { test, expect } from '@playwright/test'
import { apiGet, login } from './helpers/workflow.js'

async function fixture(page, fields = {}) {
  await login(page)
  const headers = async () => ({
    'X-CSRFToken': (await page.context().cookies()).find(cookie => cookie.name === 'csrftoken').value,
    'X-Idempotency-Key': crypto.randomUUID(),
  })
  const created = await page.request.post('/api/v1/patients/', {
    headers: await headers(), data: { first_name: 'مريض', surname: 'عقود اصطناعية', ...fields },
  })
  expect(created.status()).toBe(201)
  return { patient: (await created.json()).data, headers }
}

async function approvedVisit(page, patient, headers) {
  const response = await page.request.post(`/api/v1/patients/${patient.id}/visits/`, {
    headers: await headers(), data: { visit_date: '2026-11-07', main_complaints: 'Synthetic approved encounter', status: 'final' },
  })
  expect(response.status()).toBe(201)
  return (await response.json()).data
}

test('primary identifier selection requires a reason and preserves signed identity', async ({ page }) => {
  test.setTimeout(60000)
  const { patient, headers } = await fixture(page, { national_id: '1234567890' })
  const visit = await approvedVisit(page, patient, headers)
  const revisionsUrl = `/api/v1/visits/${visit.id}/revisions/`
  const signed = (await (await apiGet(page, revisionsUrl)).json()).data
  const created = await page.request.post(`/api/v1/patients/${patient.id}/records/`, {
    headers: await headers(), data: { kind: 'identifiers', version: patient.version,
      fields: { identifier_type: 'national_id', value: '2345678901', issuer: 'Synthetic alternate issuer' } },
  })
  expect(created.status()).toBe(200)
  const alternate = (await created.json()).data.record
  await page.goto(`/patients/${patient.id}?tab=records&kind=identifiers`)
  const panel = page.getByRole('region', { name: 'السجلات المستمرة للمريض' })
  await panel.getByRole('button', { name: 'اختيار هوية أساسية', exact: true }).click()
  const form = panel.locator('form')
  expect(await form.evaluate(node => node.checkValidity())).toBe(false)
  await form.locator('input').fill('Synthetic primary identity correction')
  await form.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(form).toHaveCount(0)
  const profile = (await (await apiGet(page, `/api/v1/patients/${patient.id}/`)).json()).data
  expect(profile.national_id).toBe('2345678901')
  const records = (await (await apiGet(page, `/api/v1/patients/${patient.id}/records/?kind=identifiers`)).json()).data
  expect(records.items.filter(row => row.is_primary).map(row => row.id)).toEqual([alternate.id])
  expect((await (await apiGet(page, revisionsUrl)).json()).data).toEqual(signed)
  const history = (await (await apiGet(page, `/api/v1/patients/${patient.id}/corrections/`)).json()).data
  expect(history.items.some(row => row.reason === 'Synthetic primary identity correction'
    && row.changes.national_id?.before === '1234567890'
    && row.changes.national_id?.after === '2345678901')).toBe(true)
})

test('followup API reads retain the original completion revision after reapproval', async ({ page }) => {
  const { patient, headers } = await fixture(page)
  let visit = await approvedVisit(page, patient, headers)
  const revisionsUrl = `/api/v1/visits/${visit.id}/revisions/`
  const revisions = (await (await apiGet(page, revisionsUrl)).json()).data
  const completed = await page.request.post(`/api/v1/patients/${patient.id}/records/`, {
    headers: await headers(), data: { kind: 'follow-ups', version: patient.version,
      fields: { title: 'Synthetic completed followup', due_date: '2026-11-08', status: 'completed',
        completed_visit: visit.id, outcome_reason: 'Synthetic clinical completion' } },
  })
  expect(completed.status()).toBe(200)
  const original = (await completed.json()).data.record
  expect(original.completed_revision).toBe(revisions[0].id)
  expect(original.outcome_at).toBeTruthy()
  expect(original.outcome_by).toBeTruthy()
  for (const status of ['amended', 'final']) {
    const response = await page.request.put(`/api/v1/visits/${visit.id}/transition/`, {
      headers: await headers(), data: { status, version: visit.version, reason: 'Synthetic new approval' },
    })
    expect(response.status()).toBe(200)
    visit = (await response.json()).data
  }
  const current = (await (await apiGet(page, revisionsUrl)).json()).data
  expect(current).toHaveLength(2)
  const records = (await (await apiGet(page, `/api/v1/patients/${patient.id}/records/?kind=follow-ups`)).json()).data
  const retained = records.items.find(row => row.id === original.id)
  expect(retained.completed_revision).toBe(original.completed_revision)
  expect(retained.outcome_at).toBe(original.outcome_at)
  expect(retained.outcome_by).toBe(original.outcome_by)
})
