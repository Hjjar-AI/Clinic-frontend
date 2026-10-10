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
  await page.getByRole('textbox', { name: 'الاسم الأول', exact: true }).fill('اصطناعي')
  const surname = `متصفح ${testInfo.project.name}`
  await page.getByRole('textbox', { name: 'اسم العائلة / الكنية', exact: true }).fill(surname)
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
    data: { occupation: 'Synthetic job' }, headers: { 'X-CSRFToken': csrf, 'X-Idempotency-Key': `missing-${Date.now()}` },
  })
  expect(missing.status()).toBe(400)
  expect((await missing.json()).error.errors.version).toBeDefined()
  const updated = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    data: { occupation: 'Synthetic job' }, headers: { 'X-CSRFToken': csrf, 'X-Idempotency-Key': `update-${Date.now()}`, 'If-Match': String(patient.version) },
  })
  expect(updated.status()).toBe(200)
  const stale = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    data: { occupation: 'Stale job' }, headers: { 'X-CSRFToken': csrf, 'X-Idempotency-Key': `stale-${Date.now()}`, 'If-Match': String(patient.version) },
  })
  expect(stale.status()).toBe(409)
})

test('visit signing requires confirmation and locks the ordinary edit action', async ({ page }) => {
  await login(page)
  const csrf = (await page.context().cookies()).find(cookie => cookie.name === 'csrftoken').value
  const writeHeaders = () => ({ 'X-CSRFToken': csrf, 'X-Idempotency-Key': crypto.randomUUID() })
  const response = await page.request.post('/api/v1/patients/', {
    data: { first_name: 'زيارة', surname: 'اصطناعية' }, headers: writeHeaders(),
  })
  expect(response.status()).toBe(201)
  const patient = (await response.json()).data
  const created = await page.request.post(`/api/v1/patients/${patient.id}/visits/`, {
    data: { visit_date: '2026-10-11', main_complaints: 'Synthetic browser complaint' }, headers: writeHeaders(),
  })
  expect(created.status()).toBe(201)
  const visit = (await created.json()).data
  await page.goto(`/visits/${visit.id}`)
  await page.getByRole('button', { name: 'اعتماد الزيارة', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'نعم', exact: true }).click()
  await expect(page.getByRole('button', { name: 'اعتماد الزيارة', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'فتح تعديل موثق', exact: true })).toBeVisible()
  const signed = await page.request.get(`/api/v1/visits/${visit.id}/`)
  expect((await signed.json()).data.status).toBe('final')
  await page.reload()
  await expect(page.getByRole('button', { name: 'فتح تعديل موثق', exact: true })).toBeVisible()
})

test('operational pages render with the real API in light and dark themes', async ({ page }) => {
  test.setTimeout(120000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && message.text().includes('[ErrorBoundary]')) errors.push(message.text()) })
  await login(page)
  for (const path of ['/patients', '/visits', '/appointments', '/tasks', '/diagnoses', '/medications', '/scales', '/invoices', '/templates', '/users', '/reports/statistics', '/settings', '/backup', '/import']) {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByRole('button', { name: 'تبديل الوضع الداكن' })).toBeVisible()
    await expect(page.locator('.page-wrapper__skeleton')).toHaveCount(0)
    await expect(page.locator('.error-state-card, .error-boundary-card')).toHaveCount(0)
    await expect(page.locator('table .skeleton')).toHaveCount(0)
    await expect(page.getByText('[object Object]', { exact: true })).toHaveCount(0)
    expect(errors, path).toEqual([])
  }
  await page.getByRole('button', { name: 'تبديل الوضع الداكن' }).click()
  await expect(page.locator('body')).toHaveClass(/dark-mode/)
  expect(errors).toEqual([])
})

test('new users and templates save without an unsaved-changes prompt', async ({ page }, testInfo) => {
  await login(page)
  await page.goto('/users/new')
  await page.getByRole('textbox', { name: 'اسم المستخدم', exact: true }).fill(`synthetic_${testInfo.project.name}`)
  await page.locator('form input[type="password"]').nth(0).fill(password)
  await page.locator('form input[type="password"]').nth(1).fill(password)
  await page.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(page).toHaveURL(/\/users$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto('/templates/new')
  await page.getByRole('textbox', { name: 'اسم القالب', exact: true }).fill(`قالب ${testInfo.project.name}`)
  await page.getByRole('button', { name: 'حفظ القالب' }).click()
  await expect(page).toHaveURL(/\/templates$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
