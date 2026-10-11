import { test, expect } from '@playwright/test'

async function setup(page, fields = {}) {
  await page.goto('/login')
  await page.locator('#loginUsername').fill('browser_admin')
  await page.locator('#loginPassword').fill('Synthetic-Suite-Pass!42')
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
  const csrf = (await page.context().cookies()).find(cookie => cookie.name === 'csrftoken').value
  const headers = () => ({ 'X-CSRFToken': csrf, 'X-Idempotency-Key': crypto.randomUUID() })
  const response = await page.request.post('/api/v1/patients/', {
    data: { first_name: 'اصطناعي', surname: 'سير العمل', ...fields }, headers: headers(),
  })
  expect(response.status()).toBe(201)
  return { patient: (await response.json()).data, headers }
}

async function confirm(page) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'نعم', exact: true }).click()
}

test('contact creation, correction and retirement survive reload and retain history', async ({ page }, info) => {
  const { patient } = await setup(page)
  await page.goto(`/patients/${patient.id}?tab=records&kind=contacts`)
  await expect(page.getByRole('tab')).toHaveCount(7)
  expect(await page.getByRole('tab').evaluateAll(tabs => tabs.every(tab => tab.scrollWidth <= tab.clientWidth + 1))).toBe(true)
  if (info.project.name === 'mobile') {
    await expect(page.locator('.patient-sticky-header')).toHaveCSS('position', 'static')
  }
  const panel = page.getByRole('region', { name: 'السجلات المستمرة للمريض' })
  await panel.getByRole('button', { name: 'إضافة سجل', exact: true }).click()
  await panel.locator('form input[type=text]').first().fill('Synthetic contact')
  await panel.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(panel.locator('form')).toHaveCount(0)
  await expect(panel.getByText('Synthetic contact', { exact: true })).toBeVisible()
  await panel.getByRole('button', { name: 'تعديل', exact: true }).click()
  await panel.locator('form input[type=text]').first().fill('Corrected contact')
  await panel.locator('form input[required]').last().fill('Synthetic correction')
  await panel.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(panel.locator('form')).toHaveCount(0)
  await panel.getByRole('button', { name: 'إنهاء السجل', exact: true }).click()
  await panel.locator('form input').fill('No longer current')
  await panel.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(panel.locator('form')).toHaveCount(0)
  await page.reload()
  await expect(panel.getByText('Corrected contact', { exact: true })).toBeVisible()
  await expect(panel.getByText('سجل سابق: No longer current')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'تعديل', exact: true })).toHaveCount(0)
  const state = await page.request.get(`/api/v1/patients/${patient.id}/records/?kind=contacts`)
  expect((await state.json()).data.version).toBe(4)
  const history = await page.request.get(`/api/v1/patients/${patient.id}/corrections/`)
  expect((await history.json()).data.total).toBe(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true)
})

test('stale longitudinal form keeps user edits and cannot overwrite a newer patient version', async ({ page }) => {
  const { patient, headers } = await setup(page)
  await page.goto(`/patients/${patient.id}?tab=records&kind=contacts`)
  const panel = page.getByRole('region', { name: 'السجلات المستمرة للمريض' })
  await panel.getByRole('button', { name: 'إضافة سجل', exact: true }).click()
  await panel.locator('form input[type=text]').first().fill('Unsaved browser draft')
  const update = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    headers: headers(), data: { occupation: 'Changed in another session', version: patient.version },
  })
  expect(update.status()).toBe(200)
  await panel.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(panel.getByText(/إذا تغير الملف فألغ التعديل/)).toBeVisible()
  await expect(panel.locator('form input[type=text]').first()).toHaveValue('Unsaved browser draft')
  const records = await page.request.get(`/api/v1/patients/${patient.id}/records/?kind=contacts`)
  expect((await records.json()).data.total).toBe(0)
})

test('document upload, metadata correction, download and archive retain original bytes', async ({ page }) => {
  const { patient } = await setup(page)
  await page.goto(`/patients/${patient.id}?tab=documents`)
  const panel = page.getByRole('region', { name: 'مستندات المريض' })
  const bytes = Buffer.from('%PDF-1.4\n% Synthetic browser document\n1 0 obj\n<<>>\nendobj\n%%EOF\n')
  await panel.locator('input[type=file]').setInputFiles({ name: 'synthetic-browser.pdf', mimeType: 'application/pdf', buffer: bytes })
  await panel.getByRole('button', { name: 'رفع المستند', exact: true }).click()
  await expect(panel.locator('article')).toHaveCount(1)
  await panel.getByRole('button', { name: 'تعديل البيانات', exact: true }).click()
  await panel.locator('form input[maxlength="200"]').first().fill('Corrected source')
  await panel.getByRole('button', { name: 'حفظ بيانات المستند', exact: true }).click()
  await expect(panel.locator('article')).toContainText('Corrected source')
  const downloadEvent = page.waitForEvent('download')
  await panel.getByRole('button', { name: 'تنزيل', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('synthetic-browser.pdf')
  const stream = await download.createReadStream()
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  expect(Buffer.concat(chunks)).toEqual(bytes)
  await panel.getByRole('button', { name: 'أرشفة المستند', exact: true }).click()
  await confirm(page)
  await expect(panel.locator('article')).toHaveCount(0)
  await page.reload()
  await expect(panel.locator('article')).toHaveCount(0)
})

test('duplicate review is optional and does not rewrite national identifiers', async ({ page }, info) => {
  const nationalId = { desktop: '8000000001', tablet: '8000000002', mobile: '8000000003' }[info.project.name]
  const { patient, headers } = await setup(page, { national_id: nationalId })
  const response = await page.request.post('/api/v1/patients/', {
    data: { first_name: 'ملف', surname: 'مشابه', national_id: nationalId }, headers: headers(),
  })
  expect(response.status()).toBe(201)
  const other = (await response.json()).data
  await page.goto(`/patients/${patient.id}?tab=duplicates`)
  const panel = page.getByRole('region', { name: 'مراجعة الملفات المتشابهة' })
  await panel.getByRole('button', { name: 'البحث عن ملفات متشابهة', exact: true }).click()
  await expect(panel.getByText(other.patient_number, { exact: true })).toBeVisible()
  await panel.getByRole('button', { name: 'شخص مختلف', exact: true }).click()
  await expect(panel.getByText(other.patient_number, { exact: true })).toHaveCount(0)
  await page.reload()
  await panel.getByRole('button', { name: 'البحث عن ملفات متشابهة', exact: true }).click()
  await expect(panel.getByText('لا توجد ملفات تحتاج مراجعة حالياً.')).toBeVisible()
  for (const id of [patient.id, other.id]) {
    const current = await page.request.get(`/api/v1/patients/${id}/`)
    const state = (await current.json()).data
    expect(state.national_id).toBe(nationalId)
    expect(state.is_active).toBe(true)
  }
})

test('diagnosis import previews before committing and persists imported catalog rows', async ({ page }, info) => {
  await setup(page)
  const code = `BROWSER-${info.project.name}`
  await page.goto('/import/options')
  await page.locator('#diagFile').setInputFiles({
    name: 'synthetic-diagnoses.csv', mimeType: 'text/csv',
    buffer: Buffer.from(`code,english,arabic\n${code},Synthetic browser diagnosis,تشخيص اصطناعي\n`),
  })
  await page.getByRole('button', { name: 'معاينة', exact: true }).click()
  await expect(page.getByText(/المعاينة:/)).toBeVisible()
  const before = await page.request.get(`/api/v1/options/diagnoses/?search=${code}`)
  expect(JSON.stringify((await before.json()).data)).not.toContain(code)
  await page.getByRole('button', { name: 'تنفيذ الاستيراد', exact: true }).click()
  await expect(page.getByRole('button', { name: 'معاينة', exact: true })).toBeVisible()
  const after = await page.request.get(`/api/v1/options/diagnoses/?search=${code}`)
  expect(JSON.stringify((await after.json()).data)).toContain(code)
})

test('care-team add and removal retain dated membership history after reload', async ({ page }) => {
  const { patient } = await setup(page)
  await page.goto(`/patients/${patient.id}?tab=team`)
  const member = page.getByRole('combobox', { name: 'عضو فريق الرعاية', exact: true })
  const doctor = member.locator('option').filter({ hasText: 'Synthetic doctor' })
  await expect(doctor).toHaveCount(1)
  const doctorId = await doctor.getAttribute('value')
  await member.selectOption(doctorId)
  await page.getByRole('combobox', { name: 'دور عضو فريق الرعاية', exact: true }).selectOption('coordinator')
  await page.getByRole('button', { name: 'إضافة', exact: true }).click()
  const row = page.locator('.border-bottom').filter({ hasText: 'Synthetic doctor' })
  await expect(row).toContainText('منسق')
  const remove = row.getByRole('button', { name: 'إزالة العضو من فريق الرعاية' })
  await remove.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'السبب', exact: true }).fill('Synthetic reassignment')
  await dialog.getByRole('button', { name: 'نعم', exact: true }).click()
  await expect(row).toContainText('Synthetic reassignment')
  await expect(remove).toHaveCount(0)
  await page.reload()
  await expect(row).toContainText('عضوية سابقة')
  const team = await page.request.get(`/api/v1/patients/${patient.id}/care_team/`)
  const state = (await team.json()).data
  expect(state.version).toBe(3)
  expect(state.care_team.find(entry => entry.user === Number(doctorId)).removal_reason).toBe('Synthetic reassignment')
})

test('optional merge requires preview consent and transfers records to the selected survivor', async ({ page }, info) => {
  const nationalId = { desktop: '9000000001', tablet: '9000000002', mobile: '9000000003' }[info.project.name]
  const { patient, headers } = await setup(page, { national_id: nationalId })
  const sourceResponse = await page.request.post('/api/v1/patients/', {
    data: { first_name: 'مصدر', surname: 'دمج اصطناعي', national_id: nationalId }, headers: headers(),
  })
  expect(sourceResponse.status()).toBe(201)
  const source = (await sourceResponse.json()).data
  const contact = await page.request.post(`/api/v1/patients/${source.id}/records/`, {
    data: { kind: 'contacts', fields: { name: 'Transferred synthetic contact' }, version: source.version }, headers: headers(),
  })
  expect(contact.status()).toBe(200)
  await page.goto(`/patients/${patient.id}?tab=duplicates`)
  const panel = page.getByRole('region', { name: 'مراجعة الملفات المتشابهة' })
  await panel.getByRole('button', { name: 'البحث عن ملفات متشابهة', exact: true }).click()
  await panel.getByRole('button', { name: 'معاينة دمج هذا الملف في الملف الحالي', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText(source.patient_number)
  await expect(dialog).toContainText(patient.patient_number)
  const execute = dialog.getByRole('button', { name: 'تنفيذ الدمج', exact: true })
  await expect(execute).toBeDisabled()
  await dialog.locator('textarea').fill('Same synthetic patient confirmed')
  await expect(execute).toBeDisabled()
  await dialog.locator('input[type=checkbox]').check()
  await expect(execute).toBeEnabled()
  await execute.click()
  await expect(dialog).toHaveCount(0)
  const records = await page.request.get(`/api/v1/patients/${patient.id}/records/?kind=contacts`)
  expect((await records.json()).data.items[0].name).toBe('Transferred synthetic contact')
  const survivor = await page.request.get(`/api/v1/patients/${patient.id}/`)
  expect((await survivor.json()).data.first_name).toBe(patient.first_name)
  const oldSource = await page.request.get(`/api/v1/patients/${source.id}/`)
  expect(oldSource.status()).toBe(404)
  await page.reload()
  await expect(page.getByRole('region', { name: 'مراجعة الملفات المتشابهة' })).toBeVisible()
})
