import { test, expect } from '@playwright/test'
import { setup, confirm, downloaded } from './helpers/workflow.js'

test('optional clinical layout, navigator, acknowledgement and approved handover preserve source ownership', async ({ page }, info) => {
  test.setTimeout(120000)
  const { patient, headers } = await setup(page, info, 'مساحة سريرية')
  const approved = await page.request.post(`/api/v1/patients/${patient.id}/visits/`, { headers: await headers(), data: {
    visit_date: '2026-10-12', main_complaints: 'APPROVED-COMPLAINT', treatment_text: 'APPROVED-REFERENCE-PLAN', status: 'final',
    medications_input: [{ name: 'SYNTHETIC-RX', dosage: '10 mg', schedule: 'تعليمات اصطناعية طويلة مسجلة دون استنتاج أوقات جديدة. '.repeat(3) }],
  } })
  expect(approved.status()).toBe(201)
  await page.goto('/preferences')
  await page.getByRole('combobox', { name: 'كثافة القوائم', exact: true }).selectOption('compact')
  await page.getByRole('checkbox', { name: 'عرض مرجع معتمد بجانب محرر الزيارة', exact: true }).check()
  await page.getByRole('checkbox', { name: 'إظهار التفاصيل الاختيارية عند الطلب', exact: true }).check()
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'كثافة القوائم', exact: true })).toHaveValue('compact')
  await page.goto(`/patients/${patient.id}/visits/new`)
  const reference = page.getByRole('complementary', { name: 'مرجع سريري معتمد', exact: true })
  await expect(reference.getByText('APPROVED-REFERENCE-PLAN', { exact: true })).toBeVisible()
  expect(await reference.locator('input,textarea').count()).toBe(0)
  const context = page.getByRole('region', { name: 'سياق المريض والزيارة', exact: true })
  await expect(context).toBeVisible()
  await page.getByRole('textbox', { name: 'الشكوى الرئيسية', exact: true }).fill('CURRENT-WORKING-COMPLAINT')
  await expect(page.getByText('تغييرات غير محفوظة', { exact: true })).toBeVisible()
  const navigator = page.getByRole('navigation', { name: 'أقسام توثيق الزيارة', exact: true })
  await navigator.getByRole('button', { name: /^الفحص/ }).click()
  await page.getByRole('textbox', { name: 'الفحص العقلي (MSE)', exact: true }).fill('CURRENT-EXAMINATION')
  await navigator.getByRole('button', { name: /^التوثيق/ }).click()
  await page.getByRole('checkbox', { name: 'تم شرح التعليمات', exact: true }).check()
  await page.getByRole('combobox', { name: 'هل احتاج توضيحاً إضافياً؟', exact: true }).selectOption({ label: 'لا' })
  const saved = page.waitForResponse(response => response.url().includes(`/patients/${patient.id}/visits/`) && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'حفظ الزيارة', exact: true }).click()
  const response = await saved
  expect(response.status()).toBe(201)
  const visit = (await response.json()).data
  expect(visit.medications).toHaveLength(0)
  expect(visit.clinical_data.instruction_acknowledgement.clarification_needed).toBe(false)
  expect(visit.clinical_data.instruction_acknowledgement.recorded_by_id).toBeTruthy()
  await page.goto(`/visits/${visit.id}`)
  await page.getByRole('button', { name: 'اعتماد الزيارة', exact: true }).click()
  await confirm(page)
  await page.getByRole('button', { name: 'إنشاء ملخص تسليم معتمد', exact: true }).click()
  await expect(page.getByRole('region', { name: 'معاينة ملخص التسليم السريري', exact: true })).toBeVisible({ timeout: 20000 })
  await downloaded(page, info, 'handover.pdf', () => page.getByRole('link', { name: 'تنزيل ملخص التسليم', exact: true }).click())
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('list column preferences, server sorting and responsive visit previews work without editing records', async ({ page }, info) => {
  test.setTimeout(90000)
  const { patient, headers } = await setup(page, info, 'معاينة واجهة')
  const created = await page.request.post(`/api/v1/patients/${patient.id}/visits/`, { headers: await headers(), data: { visit_date: '2026-10-13', main_complaints: 'PREVIEW-ONLY-COMPLAINT' } })
  expect(created.status()).toBe(201)
  const visit = (await created.json()).data
  await page.goto(`/visits?search=${encodeURIComponent(patient.surname)}`)
  const columns = page.locator('.table-column-controls')
  await columns.locator('summary').click()
  await columns.getByRole('checkbox', { name: 'الحالة السريرية', exact: true }).uncheck()
  await expect(page.locator('td[data-label="الحالة السريرية"]')).toHaveCount(0)
  if (info.project.name === 'desktop') await page.getByRole('button', { name: /^تاريخ الزيارة/ }).click()
  else await page.getByRole('combobox', { name: 'اتجاه الفرز', exact: true }).selectOption('asc')
  await expect(page).toHaveURL(/sort_order=asc/)
  await page.reload()
  await expect(page.locator('td[data-label="الحالة السريرية"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'معاينة التفاصيل', exact: true }).click()
  await expect(page.getByText('PREVIEW-ONLY-COMPLAINT', { exact: true }).last()).toBeVisible()
  if (info.project.name === 'desktop') {
    await expect(page.getByRole('complementary', { name: 'تفاصيل الزيارة', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'إغلاق التفاصيل', exact: true }).click()
  } else {
    const panel = page.getByRole('dialog', { name: 'تفاصيل الزيارة', exact: true })
    await expect(panel).toBeVisible()
    const box = await panel.boundingBox()
    expect(Math.abs(box.height - page.viewportSize().height)).toBeLessThan(2)
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
  }
  const unchanged = (await (await page.request.get(`/api/v1/visits/${visit.id}/`)).json()).data
  expect(unchanged.version).toBe(visit.version)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
