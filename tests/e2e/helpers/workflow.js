import { expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const password = 'Synthetic-Suite-Pass!42'
export async function login(page) {
  await page.goto('/login')
  await page.locator('#loginUsername').fill('browser_admin')
  await page.locator('#loginPassword').fill(password)
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
}
export async function setup(page, info, surname = 'سير سريري') {
  await login(page)
  const headers = async () => ({
    'X-CSRFToken': (await page.context().cookies()).find(c => c.name === 'csrftoken').value,
    'X-Idempotency-Key': crypto.randomUUID(),
  })
  const response = await page.request.post('/api/v1/patients/', {
    data: { first_name: 'مريض', surname: `${surname} ${info.project.name}` }, headers: await headers(),
  })
  expect(response.status()).toBe(201)
  return { patient: (await response.json()).data, headers }
}
export async function confirm(page, name = 'نعم') {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name, exact: true }).click()
}
export function items(body) {
  const data = body.data
  return Array.isArray(data) ? data : data.items || data.results || data.patients || data.medications || []
}
export async function downloaded(page, info, name, action, pdf = true) {
  const pending = page.waitForEvent('download')
  await action()
  const download = await pending
  const stream = await download.createReadStream()
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  const bytes = Buffer.concat(chunks)
  if (pdf) expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
  return retained(info, name, bytes)
}
export async function retained(info, name, bytes) {
  const target = process.env.CLINIC_PDF_ARTIFACT_DIR || info.outputPath('documents')
  await mkdir(target, { recursive: true })
  const filename = path.join(target, `${info.project.name}-${name}`)
  await writeFile(filename, bytes)
  return { bytes, filename }
}
