import { expect, test } from '@playwright/test'
import { downloaded, password, setup } from './helpers/workflow.js'

async function openVisit(page, patientId, query = '') {
  await page.goto(`/patients/${patientId}/visits/new${query}`)
  await expect(page.getByRole('textbox', { name: 'الشكوى الرئيسية', exact: true })).toBeEnabled({ timeout: 20000 })
}

test('fresh visits cannot inherit another patient goal; editing retains it and duplication clears it', async ({ page }, info) => {
  test.setTimeout(90000)
  const { patient, headers } = await setup(page, info, 'عزل هدف الزيارة')
  const result = await page.request.post('/api/v1/patients/', { headers: await headers(), data: { first_name: 'اصطناعي', surname: `هدف ثان ${info.project.name}` } })
  expect(result.status()).toBe(201)
  const second = (await result.json()).data
  await openVisit(page, patient.id)
  await page.getByRole('button', { name: '+ إضافة هدف', exact: true }).click()
  await page.getByPlaceholder('الهدف', { exact: true }).fill('SYNTHETIC-FIRST-PATIENT-GOAL')
  await page.getByRole('button', { name: 'إلغاء', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'مغادرة', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/patients/${patient.id}$`))
  // Use in-app navigation for the new mount after the first form has mutated defaults.
  const search = page.getByRole('combobox', { name: 'بحث سريع...', exact: true })
  await search.fill(second.surname)
  await expect(page.locator('.navbar__search-results [role=option]')).not.toHaveCount(0)
  await search.press('ArrowDown')
  await search.press('Enter')
  await expect(page).toHaveURL(new RegExp(`/patients/${second.id}$`))
  await page.getByRole('link', { name: 'زيارة جديدة', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'الشكوى الرئيسية', exact: true })).toBeEnabled()
  await expect(page.getByPlaceholder('الهدف', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '+ إضافة هدف', exact: true }).click()
  await page.getByPlaceholder('الهدف', { exact: true }).fill('SYNTHETIC-SECOND-PATIENT-GOAL')
  await page.getByRole('textbox', { name: 'الشكوى الرئيسية', exact: true }).fill('Synthetic goal isolation visit')
  const pending = page.waitForResponse(response => response.url().endsWith(`/patients/${second.id}/visits/`) && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'حفظ الزيارة', exact: true }).click()
  const response = await pending
  expect(response.status()).toBe(201)
  const visit = (await response.json()).data
  expect(visit.clinical_data.goals.map(goal => goal.title)).toEqual(['SYNTHETIC-SECOND-PATIENT-GOAL'])
  await page.goto(`/visits/${visit.id}/edit`)
  await expect(page.getByPlaceholder('الهدف', { exact: true })).toHaveValue('SYNTHETIC-SECOND-PATIENT-GOAL')
  await openVisit(page, second.id, `?duplicateFrom=${visit.id}`)
  await expect(page.getByPlaceholder('الهدف', { exact: true })).toHaveCount(0)
})

test('scale picker retries a failed catalog and saves the selected scale with a zero answer', async ({ page }, info) => {
  test.setTimeout(90000)
  const { patient, headers } = await setup(page, info, 'اختيار مقياس')
  const name = `Synthetic picker scale ${info.project.name}`
  const created = await page.request.post('/api/v1/scales/', { headers: await headers(), data: { name, description: 'Synthetic picker fixture' } })
  expect(created.status()).toBe(201)
  const scale = (await created.json()).data
  const question = await page.request.post(`/api/v1/scales/${scale.id}/add-field/`, { headers: await headers(), data: { version: scale.version, label: 'Synthetic zero score', field_type: 'slider', min_val: 0, max_val: 10, step: 1, default: 0, options: '' } })
  expect(question.ok()).toBe(true)
  let rejectCatalog = true
  await page.route('**/api/v1/scales/**', route => route.request().method() === 'GET' && rejectCatalog
    ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Synthetic catalog outage' } }) })
    : route.continue())
  await openVisit(page, patient.id)
  await page.getByRole('button', { name: 'إضافة مقياس', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'اختر مقياساً', exact: true })
  await expect(dialog.getByRole('alert')).toContainText('تعذر تحميل المقاييس')
  rejectCatalog = false
  await dialog.getByRole('button', { name: 'إعادة المحاولة', exact: true }).click()
  await dialog.getByRole('button', { name, exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText(name, { exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'الشكوى الرئيسية', exact: true }).fill('Synthetic scale visit')
  const pending = page.waitForResponse(response => response.url().endsWith(`/patients/${patient.id}/visits/`) && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'حفظ الزيارة', exact: true }).click()
  const saved = await pending
  expect(saved.status()).toBe(201)
  const visit = (await saved.json()).data
  await page.goto(`/visits/${visit.id}/edit`)
  await expect(page.getByText(name, { exact: true })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Synthetic zero score', exact: true })).toHaveValue('0')
})

test('form breadcrumbs render and one account-scoped patient chooser controls table and exports', async ({ page }, info) => {
  test.setTimeout(120000)
  const { patient, headers } = await setup(page, info, 'أعمدة ومسار')
  for (const path of ['/patients/new', '/appointments/new', '/invoices/new', '/templates/new', '/users/new']) {
    await page.goto(path)
    await expect(page.locator('.form-container > .breadcrumb')).toBeVisible()
    await expect(page.locator('fieldset')).toBeEnabled()
  }
  await page.goto('/patients')
  await expect(page.locator('.table-column-controls')).toHaveCount(1)
  const columns = page.locator('.table-column-controls')
  await columns.locator('summary').click()
  await expect(columns.getByRole('checkbox', { name: 'رقم الملف', exact: true })).toBeDisabled()
  await expect(columns.getByRole('checkbox', { name: 'الاسم', exact: true })).toBeDisabled()
  await columns.getByRole('checkbox', { name: 'الهاتف', exact: true }).uncheck()
  await expect(page.locator('th').filter({ hasText: /^الهاتف$/ })).toHaveCount(0)
  const request = page.waitForRequest(request => request.url().includes('/exports/patients/csv/'))
  await downloaded(page, info, 'structure-patient-columns.csv', () => page.getByRole('button', { name: 'تصدير CSV', exact: true }).click(), false)
  const fields = new URL((await request).url()).searchParams.get('fields').split(',')
  expect(fields).not.toContain('phone')
  expect(fields).toContain('patient_number')
  expect(fields).toContain('full_name')
  await page.reload()
  await columns.locator('summary').click()
  await expect(columns.getByRole('checkbox', { name: 'الهاتف', exact: true })).not.toBeChecked()
  const loggedOut = await page.request.post('/api/v1/auth/logout/', { headers: await headers() })
  expect(loggedOut.ok()).toBe(true)
  await page.goto('/login')
  await page.locator('#loginUsername').fill('browser_doctor')
  await page.locator('#loginPassword').fill(password)
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
  await page.goto('/patients')
  await columns.locator('summary').click()
  await expect(columns.getByRole('checkbox', { name: 'الهاتف', exact: true })).toBeChecked()
  expect(patient.id).toBeTruthy()
})
