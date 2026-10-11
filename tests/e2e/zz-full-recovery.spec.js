import { test, expect } from '@playwright/test'
import { createHash } from 'node:crypto'
import { setup, login, downloaded } from './helpers/workflow.js'

const signature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1sAAAAASUVORK5CYII='

test('full ZIP UI restores clinical/financial/media inventory and revokes the old session', async ({ page }, info) => {
  test.setTimeout(180000)
  const { patient, headers } = await setup(page, info, 'استعادة كاملة')
  const createVisit = await page.request.post(`/api/v1/patients/${patient.id}/visits/`, {
    headers: await headers(), data: { visit_date: '2026-10-11', main_complaints: 'زيارة اصطناعية محفوظة', status: 'final' },
  })
  expect(createVisit.status()).toBe(201)
  const visit = (await createVisit.json()).data
  const media = Buffer.from(signature.split(',')[1], 'base64')
  const upload = await page.request.post(`/api/v1/patients/${patient.id}/documents/`, {
    headers: await headers(), multipart: { file: { name: 'synthetic-restore.png', mimeType: 'image/png', buffer: media }, source: 'Synthetic recovery fixture' },
  })
  expect(upload.status()).toBe(201)
  const document = (await upload.json()).data
  const preview = (await (await page.request.get(`/api/v1/prescription/visit/${visit.id}/`)).json()).data
  const issued = await page.request.post('/api/v1/prescription/generate/', {
    headers: await headers(), data: { visit_id: visit.id, preview_token: preview.preview_token, signature },
  })
  expect(issued.status()).toBe(200)
  const issuedHash = createHash('sha256').update(await issued.body()).digest('hex')
  const revisionsBefore = (await (await page.request.get(`/api/v1/visits/${visit.id}/revisions/`)).json()).data
  const invoiceCreate = await page.request.post('/api/v1/billing/', {
    headers: await headers(), data: { patient_id: patient.id, total_amount: '17.25', payment_method: 'cash', issued_date: '2026-10-11' },
  })
  expect(invoiceCreate.status()).toBe(201)
  let invoice = (await invoiceCreate.json()).data
  for (const status of ['issued', 'paid']) {
    const changed = await page.request.put(`/api/v1/billing/${invoice.id}/transition/`, {
      headers: await headers(), data: { status, version: invoice.version },
    })
    expect(changed.status()).toBe(200)
    invoice = (await changed.json()).data
  }
  await page.goto('/backup')
  const pending = page.waitForResponse(r => /\/backup\/$/.test(r.url()) && r.request().method() === 'POST')
  const archive = await downloaded(page, info, 'full-backup.zip', () => page.getByRole('button', { name: 'توليد وتحميل', exact: true }).click(), false)
  const backupResponse = await pending
  expect(backupResponse.status()).toBe(200)
  expect(createHash('sha256').update(archive.bytes).digest('hex')).toBe(backupResponse.headers()['x-backup-sha256'])
  const marker = await page.request.post('/api/v1/patients/', {
    headers: await headers(), data: { first_name: 'بعد', surname: 'النسخة الاصطناعية' },
  })
  expect(marker.status()).toBe(201)
  const markerId = (await marker.json()).data.id
  const changed = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    headers: await headers(), data: { occupation: 'Changed after snapshot', version: patient.version },
  })
  expect(changed.status()).toBe(200)
  const archived = await page.request.delete(`/api/v1/patients/${patient.id}/documents/${document.id}/`, {
    headers: await headers(), data: { version: document.version },
  })
  expect(archived.status()).toBe(204)
  await page.locator('#restoreFile').setInputFiles({ name: 'synthetic-full-backup.zip', mimeType: 'application/zip', buffer: archive.bytes })
  const previewButton = page.getByRole('button', { name: 'معاينة الملف', exact: true })
  await expect(previewButton).toBeDisabled()
  await page.getByRole('checkbox', { name: 'أوافق على مسح كافة السجلات الحالية.', exact: true }).check()
  await previewButton.click()
  await expect(page.getByText('نتيجة الفحص', { exact: true })).toBeVisible()
  const execute = page.getByRole('button', { name: /تنفيذ الاستعادة/ })
  await expect(execute).toBeDisabled()
  await page.getByRole('textbox', { name: 'اكتب RESTORE CLINIC للتأكيد', exact: true }).fill('RESTORE CLINIC')
  await expect(execute).toBeDisabled()
  await page.getByRole('checkbox', { name: 'تأكيد التدمير والاستعادة', exact: true }).check()
  const restoring = page.waitForResponse(r => r.url().endsWith('/backup/restore/execute/') && r.request().method() === 'POST')
  await execute.click()
  const restored = await restoring
  expect(restored.status()).toBe(200)
  expect((await restored.json()).data.safety_backup).toMatch(/^safety_before_restore_.*\.zip$/)
  const oldSession = await page.request.get('/api/v1/auth/me/')
  expect([401, 403]).toContain(oldSession.status())
  await page.reload()
  await expect(page).toHaveURL(/\/login/)
  await login(page)
  const recovered = (await (await page.request.get(`/api/v1/patients/${patient.id}/`)).json()).data
  expect(recovered.occupation).toBe(patient.occupation)
  expect((await page.request.get(`/api/v1/patients/${markerId}/`)).status()).toBe(404)
  const download = await page.request.get(`/api/v1/patients/${patient.id}/documents/${document.id}/download/`)
  expect(download.status()).toBe(200)
  expect(await download.body()).toEqual(media)
  const revisionsAfter = (await (await page.request.get(`/api/v1/visits/${visit.id}/revisions/`)).json()).data
  expect(revisionsAfter).toEqual(revisionsBefore)
  const documents = (await (await page.request.get(`/api/v1/visits/${visit.id}/issued-documents/`)).json()).data
  expect(documents[0].checksum).toBe(issuedHash)
  const payment = (await (await page.request.get(`/api/v1/billing/${invoice.id}/`)).json()).data
  expect(payment.status).toBe('paid')
  expect(payment.final_amount).toBe('17.25')
  expect(payment.paid_at).toBe(invoice.paid_at)
  expect(payment.paid_by).toBe(invoice.paid_by)
  await page.goto(`/patients/${patient.id}?tab=documents`)
  await expect(page.getByText('synthetic-restore.png', { exact: false })).toBeVisible()
})
