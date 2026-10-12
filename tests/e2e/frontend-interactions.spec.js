import { test, expect } from '@playwright/test'
import { login, password, setup } from './helpers/workflow.js'

async function bounds(locator, page) {
  await expect.poll(async () => {
    const rect = await locator.boundingBox(), size = page.viewportSize()
    return !!rect && rect.x >= 0 && rect.x + rect.width <= size.width + 1
      && rect.y >= 0 && rect.y + rect.height <= size.height + 1
  }).toBe(true)
}

test('global search supports keyboard selection, dismissal and bounded empty/results panels', async ({ page }, info) => {
  const { patient } = await setup(page, info, 'بحث اصطناعي')
  await page.goto('/patients')
  const search = page.getByRole('combobox', { name: 'بحث سريع...' })
  const header = page.locator('.app-topbar')
  const before = await header.boundingBox()
  await search.fill('zzzz-no-synthetic-match')
  const panel = page.locator('.navbar__search-results')
  await expect(panel.getByText('لا توجد نتائج', { exact: true })).toBeVisible()
  expect((await header.boundingBox()).height).toBe(before.height)
  await bounds(panel, page)
  await search.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(search).toBeFocused()
  await search.fill(patient.surname)
  await expect(panel.locator('[role=option]')).not.toHaveCount(0)
  await bounds(panel, page)
  await search.press('ArrowUp')
  await expect(search).toHaveAttribute('aria-activedescendant', await panel.locator('[role=option]').last().getAttribute('id'))
  await search.press('ArrowDown')
  await expect(search).toHaveAttribute('aria-activedescendant', await panel.locator('[role=option]').first().getAttribute('id'))
  await search.press('Enter')
  await expect(page).toHaveURL(new RegExp(`/patients/${patient.id}$`))
  await expect(panel).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.getItem('clinic_recent_searches'))).toBeNull()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
})

test('notification badge, keyboard dismissal, focus departure and resized geometry stay current', async ({ page }, info) => {
  await page.goto('/login')
  await page.locator('#loginUsername').fill(`browser_panel_${info.project.name}`)
  await page.locator('#loginPassword').fill(password)
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
  const bell = page.getByRole('button', { name: 'الإشعارات', exact: true })
  const panel = page.locator('.notification-center__dropdown')
  await expect(bell.locator('.badge__value')).toContainText('٢')
  await bell.focus()
  await bell.press('ArrowDown')
  await expect(panel).toBeVisible()
  await bounds(panel, page)
  await expect(panel.getByRole('link', { name: 'عرض الكل' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(bell).toBeFocused()
  await bell.click()
  await panel.getByRole('button', { name: 'قراءة', exact: true }).first().click()
  await expect(bell.locator('.badge__value')).toContainText('١')
  const original = page.viewportSize()
  await page.setViewportSize({ width: 340, height: 620 })
  await bounds(panel, page)
  await page.setViewportSize({ width: 430, height: 650 })
  await bounds(panel, page)
  await page.setViewportSize(original)
  await panel.getByRole('button', { name: 'قراءة الكل', exact: true }).click()
  await expect(bell.locator('.badge__value')).toHaveCount(0)
  await page.getByRole('button', { name: 'تبديل الوضع الداكن' }).focus()
  await expect(panel).toHaveCount(0)
  await bell.click()
  await panel.getByRole('link', { name: 'عرض الكل' }).click()
  await expect(page).toHaveURL(/\/notifications$/)
  await expect(panel).toHaveCount(0)
})

test('modal and mobile drawer trap keyboard focus and restore their trigger on Escape', async ({ page }, info) => {
  await login(page)
  await page.goto('/diagnoses')
  const trigger = page.getByRole('button', { name: 'إضافة تشخيص جديد' })
  await trigger.focus()
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'إغلاق', exact: true })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'حفظ', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'إغلاق', exact: true })).toBeFocused()
  expect(await page.locator('.app-layout').evaluate(element => Boolean(element.closest('[inert]')))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  if (info.project.name !== 'desktop') {
    const toggle = page.getByRole('button', { name: 'تبديل القائمة', exact: true })
    await toggle.focus()
    await toggle.press('Enter')
    const drawer = page.locator('#app-navigation')
    await expect(drawer).toHaveAttribute('aria-modal', 'true')
    expect(await drawer.evaluate(element => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Shift+Tab')
    expect(await drawer.evaluate(element => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  }
})

test('real charts paint, expose hover/legend interactions, update themes and survive filtering/navigation', async ({ page }, info) => {
  const { patient, headers } = await setup(page, info, 'بيانات رسم')
  const patch = await page.request.patch(`/api/v1/patients/${patient.id}/`, {
    headers: { ...await headers(), 'If-Match': String(patient.version) }, data: { gender: 'ذكر', correction_reason: 'Synthetic chart fixture correction' },
  })
  expect(patch.status()).toBe(200)
  const visit = await page.request.post(`/api/v1/patients/${patient.id}/visits/`, {
    headers: await headers(), data: { visit_date: '2026-10-11', main_complaints: 'Synthetic chart visit' },
  })
  expect(visit.status()).toBe(201)
  let moduleUrl
  page.on('response', response => { if (response.url().includes('chart__js_auto.js')) moduleUrl = response.url() })
  await page.goto('/reports/statistics')
  const canvas = page.locator('.chart-card canvas').first()
  await expect(canvas).toBeVisible()
  await expect.poll(() => canvas.evaluate(element => {
    const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data
    return pixels.some((value, index) => index % 4 === 3 && value > 0)
  })).toBe(true)
  expect(moduleUrl).toBeTruthy()
  const snapshot = () => page.evaluate(async url => {
    const { default: Chart } = await import(url)
    const canvas = document.querySelector('.chart-card canvas')
    const chart = Chart.getChart(canvas)
    return { id: chart.id, legend: chart.options.plugins.legend.position, rtl: chart.options.plugins.tooltip.rtl,
      color: chart.data.datasets[0].backgroundColor[0], values: chart.data.datasets[0].data,
      legends: chart.legend.legendItems.map(item => ({ text: item.text, hidden: item.hidden })),
      trend: Chart.getChart([...document.querySelectorAll('.chart-card')].find(card => card.textContent.includes('الزيارات الشهرية'))?.querySelector('canvas'))?.data.datasets[0].data || [],
      instances: Object.keys(Chart.instances).length }
  }, moduleUrl)
  const first = await snapshot()
  expect(first.rtl).toBe(true)
  expect(first.legend).toBe(info.project.name === 'mobile' ? 'bottom' : 'right')
  await canvas.scrollIntoViewIfNeeded()
  await expect.poll(() => page.evaluate(async url => {
    const { default: Chart } = await import(url)
    const chart = Chart.getChart(document.querySelector('.chart-card canvas'))
    const arc = chart.getDatasetMeta(0).data.find((arc, index) => chart.data.datasets[0].data[index] > 0)
    if (!arc) return false
    return arc.circumference > 0 && Math.abs(arc.circumference - arc.getProps(['circumference'], true).circumference) < 0.001
  }, moduleUrl)).toBe(true)
  const arc = await page.evaluate(async url => {
    const { default: Chart } = await import(url)
    const chart = Chart.getChart(document.querySelector('.chart-card canvas'))
    const point = chart.getDatasetMeta(0).data.find((arc, index) => chart.data.datasets[0].data[index] > 0).getCenterPoint()
    const rect = chart.canvas.getBoundingClientRect()
    return { x: rect.x + point.x, y: rect.y + point.y }
  }, moduleUrl)
  await page.mouse.move(arc.x, arc.y)
  await expect.poll(() => page.evaluate(async url => {
    const { default: Chart } = await import(url)
    return Chart.getChart(document.querySelector('.chart-card canvas')).tooltip.opacity
  }, moduleUrl)).toBeGreaterThan(0)
  const legend = await page.evaluate(async url => {
    const { default: Chart } = await import(url)
    const chart = Chart.getChart(document.querySelector('.chart-card canvas'))
    const box = chart.legend.legendHitBoxes[0], rect = chart.canvas.getBoundingClientRect()
    return { x: rect.x + box.left + box.width / 2, y: rect.y + box.top + box.height / 2 }
  }, moduleUrl)
  await page.mouse.click(legend.x, legend.y)
  await expect.poll(async () => (await snapshot()).legends[0].hidden).toBe(true)
  await page.getByRole('button', { name: 'تبديل الوضع الداكن' }).click()
  await expect.poll(async () => (await snapshot()).id).not.toBe(first.id)
  await page.getByRole('textbox', { name: 'بداية الفترة', exact: true }).fill('01/01/2100')
  await page.getByRole('textbox', { name: 'نهاية الفترة', exact: true }).fill('31/12/2100')
  await page.getByRole('textbox', { name: 'نهاية الفترة', exact: true }).press('Escape')
  await expect(page.locator('.flatpickr-calendar.open')).toHaveCount(0)
  await page.locator('.date-range-picker').getByRole('button', { name: 'تطبيق', exact: true }).click()
  await expect.poll(async () => (await snapshot()).trend.every(value => value === 0)).toBe(true)
  await page.locator('.date-range-picker').getByRole('button', { name: 'مسح', exact: true }).click()
  await expect.poll(async () => (await snapshot()).trend.some(value => value > 0)).toBe(true)
  await page.locator('a[href="/patients"]:visible').first().click()
  await expect(page).toHaveURL(/\/patients$/)
  expect(await page.evaluate(async url => { const { default: Chart } = await import(url); return Object.keys(Chart.instances).length }, moduleUrl)).toBe(0)
})
