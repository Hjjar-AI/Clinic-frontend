import { test, expect } from '@playwright/test'

const password = 'Synthetic-Suite-Pass!42'
async function login(page, role = 'admin') {
  await page.goto('/login')
  await page.locator('#loginUsername').fill(`browser_${role}`)
  await page.locator('#loginPassword').fill(password)
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

test('protected routes redirect guests; password visibility and rejected login', async ({ page }) => {
  await page.goto('/patients')
  await expect(page).toHaveURL(/\/login/)
  await page.locator('#loginUsername').fill('browser_admin')
  await page.locator('#loginPassword').fill('Wrong-Synthetic-Pass!42')
  await page.getByRole('button', { name: 'إظهار كلمة المرور' }).click()
  await expect(page.locator('#loginPassword')).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.locator('.alert--danger')).not.toHaveCount(0)
})

test('admin creates a patient with unknown demographics and can reopen the record', async ({ page }, testInfo) => {
  await login(page)
  await page.goto('/patients/new')
  await page.getByLabel('الاسم الأول', { exact: true }).fill('اصطناعي')
  const surname = `متصفح ${testInfo.project.name}`
  await page.getByLabel('اسم العائلة / الكنية', { exact: true }).fill(surname)
  await page.getByRole('button', { name: 'حفظ وإنشاء الملف' }).click()
  await expect(page).toHaveURL(/\/patients\/\d+$/)
  await expect(page.getByText(surname, { exact: false }).first()).toBeVisible()
  await page.reload()
  await expect(page.getByText(surname, { exact: false }).first()).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  expect(overflow).toBe(false)
})

test('receptionist has patient access and cannot open user administration', async ({ page }) => {
  await login(page, 'receptionist')
  await page.goto('/patients')
  await expect(page).toHaveURL(/\/patients$/)
  await page.goto('/users')
  await expect(page).not.toHaveURL(/\/users$/)
})

test('real API preserves CSRF, idempotency replay, and optimistic concurrency', async ({ page }) => {
  await login(page)
  const cookies = await page.context().cookies()
  const csrf = cookies.find(cookie => cookie.name === 'csrftoken').value
  const headers = { 'X-CSRFToken': csrf, 'X-Idempotency-Key': `browser-${Date.now()}` }
  const data = { first_name: 'تكرار', surname: 'اصطناعي' }
  const created = await page.request.post('/api/v1/patients/', { data, headers })
  expect(created.status()).toBe(201)
  const body = await created.json()
  const patient = body.data
  const replay = await page.request.post('/api/v1/patients/', { data, headers })
  expect(await replay.json()).toEqual(body)
  const missing = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    data: { surname: 'تغيير' }, headers: { 'X-CSRFToken': csrf, 'X-Idempotency-Key': `missing-${Date.now()}` },
  })
  expect(missing.status()).toBe(428)
  const updated = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    data: { surname: 'تغيير' }, headers: { 'X-CSRFToken': csrf, 'X-Idempotency-Key': `update-${Date.now()}`, 'If-Match': String(patient.version) },
  })
  expect(updated.status()).toBe(200)
  const stale = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    data: { surname: 'قديم' }, headers: { 'X-CSRFToken': csrf, 'X-Idempotency-Key': `stale-${Date.now()}`, 'If-Match': String(patient.version) },
  })
  expect(stale.status()).toBe(409)
})
