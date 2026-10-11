import { test, expect } from '@playwright/test'
import { login } from './helpers/workflow.js'

test('task creation, lifecycle, reasoned cancellation and deletion persist through the real API', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await login(page)
  await page.goto('/tasks')
  const title = `مهمة اصطناعية ${info.project.name}`
  await page.getByRole('button', { name: 'مهمة جديدة', exact: true }).click()
  await page.getByPlaceholder('عنوان...', { exact: true }).fill(title)
  const createResponse = page.waitForResponse(response => response.url().endsWith('/api/v1/tasks/') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'حفظ', exact: true }).click()
  const created = await createResponse
  expect(created.status()).toBe(201)
  const task = (await created.json()).data
  expect(task.due_date).toBeNull()
  await expect(page.getByPlaceholder('عنوان...', { exact: true })).toHaveCount(0)
  await expect(page.locator('tbody tr').filter({ hasText: title })).toBeVisible()
  await page.reload()
  const row = page.locator('tbody tr').filter({ hasText: title })
  await expect(row).toBeVisible()
  await expect(row.getByTitle('حذف', { exact: true })).toBeDisabled()
  await row.getByTitle('بدء التنفيذ', { exact: true }).click()
  await expect(row).toContainText('قيد التنفيذ')
  await row.getByTitle('إكمال', { exact: true }).click()
  await expect(row).toContainText('مكتملة')
  await expect(row.getByTitle('حذف', { exact: true })).toBeEnabled()
  await row.getByTitle('إعادة الفتح', { exact: true }).click()
  await expect(row).toContainText('مفتوحة')
  await row.getByTitle('إلغاء', { exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'إلغاء', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(row).toContainText('مفتوحة')
  await row.getByTitle('إلغاء', { exact: true }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox', { name: 'سبب الإلغاء', exact: true }).fill('Synthetic cancellation')
  await dialog.getByRole('button', { name: 'إلغاء المهمة', exact: true }).click()
  await expect(row).toContainText('ملغية')
  await page.reload()
  await expect(row).toContainText('ملغية')
  const saved = (await (await page.request.get(`/api/v1/tasks/${task.id}/`)).json()).data
  expect(saved).toMatchObject({ status: 'cancelled', status_reason: 'Synthetic cancellation', version: 5 })
  await row.getByTitle('حذف', { exact: true }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: 'نعم', exact: true }).click()
  // The page also asks for deletion confirmation after its button confirmation.
  await page.getByRole('dialog').getByRole('button', { name: 'نعم، احذف', exact: true }).click()
  await expect(row).toHaveCount(0)
  expect((await page.request.get(`/api/v1/tasks/${task.id}/`)).status()).toBe(404)
  expect(errors).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)).toBe(false)
})

test('task permission denial leaves the existing task unchanged', async ({ page }, info) => {
  await login(page)
  const csrf = (await page.context().cookies()).find(cookie => cookie.name === 'csrftoken').value
  const created = await page.request.post('/api/v1/tasks/', {
    headers: { 'X-CSRFToken': csrf, 'X-Idempotency-Key': crypto.randomUUID() },
    data: { title: `Synthetic denied task ${info.project.name}` },
  })
  expect(created.status()).toBe(201)
  const task = (await created.json()).data
  await page.context().clearCookies()
  await page.goto('/login')
  await page.locator('#loginUsername').fill('browser_receptionist')
  await page.locator('#loginPassword').fill('Synthetic-Suite-Pass!42')
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
  await page.goto('/tasks')
  await expect(page).not.toHaveURL(/\/tasks$/)
  const token = (await page.context().cookies()).find(cookie => cookie.name === 'csrftoken').value
  const denied = await page.request.put(`/api/v1/tasks/${task.id}/complete/`, {
    headers: { 'X-CSRFToken': token, 'X-Idempotency-Key': crypto.randomUUID() }, data: { version: task.version },
  })
  expect(denied.status()).toBe(403)
  await page.context().clearCookies()
  await login(page)
  const unchanged = (await (await page.request.get(`/api/v1/tasks/${task.id}/`)).json()).data
  expect(unchanged).toMatchObject({ status: 'open', version: task.version })
})
