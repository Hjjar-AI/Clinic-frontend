import { test, expect } from '@playwright/test'
import { login, setup } from './helpers/workflow.js'

const themes = ['default', 'prussian-orange', 'vanilla-tangerine', 'ink-wheat-burnt', 'deep-space-strawberry', 'ocean-cerulean', 'rosewood-crimson', 'dusk-dusty-rosewood']

test('all theme solid controls retain readable foregrounds in light and dark mode', async ({ page }) => {
  await login(page)
  const ratios = await page.evaluate(async themes => {
    const { themeService } = await import('/src/services/themeService.js')
    const area = document.createElement('div'); area.style.position = 'fixed'; area.style.top = '200px'; area.style.left = '20px'; area.style.zIndex = '1'; document.body.append(area)
    const context = document.createElement('canvas').getContext('2d')
    const rgb = color => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => value / 255) }
    const luminance = values => values.reduce((sum, value, index) => sum + [0.2126, 0.7152, 0.0722][index] * (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4), 0)
    const results = []
    try {
      for (const theme of themes) for (const dark of [false, true]) {
        themeService.apply(theme, dark)
        for (const kind of ['btn', 'tag']) for (const variant of (kind === 'btn' ? ['primary', 'danger', 'success', 'warning', 'info', 'purple'] : ['primary', 'danger', 'success', 'warning', 'info', 'purple', 'secondary', 'grey'])) {
          const element = document.createElement(kind === 'btn' ? 'button' : 'span'); element.className = `${kind} ${kind}--${variant}`; element.textContent = 'نص اصطناعي'; area.append(element)
          const style = getComputedStyle(element), a = luminance(rgb(style.color)), b = luminance(rgb(style.backgroundColor))
          results.push({ theme, dark, kind, variant, contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }); element.remove()
        }
      }
    } finally { area.remove(); themeService.apply('default', false) }
    return results
  }, themes)
  expect(ratios).toHaveLength(224)
  expect(ratios.filter(pair => pair.contrast < 4.5)).toEqual([])
})

test('patient sibling routes preserve navigation section identity and real tab relationships', async ({ page }, info) => {
  const { patient } = await setup(page, info, 'تنقل اصطناعي')
  await page.goto(`/patients/${patient.id}`)
  await expect.poll(() => page.locator('a[href="/patients"][aria-current="location"]').count()).toBeGreaterThan(0)
  const tabs = page.getByRole('tab'); await expect(tabs.first()).toBeVisible()
  await tabs.first().focus(); await page.keyboard.press('End')
  const selected = page.getByRole('tab', { selected: true })
  await expect(selected).toBeFocused()
  const panelId = await selected.getAttribute('aria-controls'); const panel = page.locator(`[id="${panelId}"]`)
  await expect(panel).toBeVisible(); await expect(panel).toHaveAttribute('role', 'tabpanel'); await expect(panel).toHaveAttribute('aria-labelledby', await selected.getAttribute('id'))
  await page.keyboard.press('ArrowRight'); await expect(tabs.nth(await tabs.count() - 2)).toHaveAttribute('aria-selected', 'true')
  await page.evaluate(() => { document.documentElement.dir = 'ltr' }); await page.keyboard.press('End'); await page.keyboard.press('ArrowRight'); await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  await page.evaluate(() => { document.documentElement.dir = 'rtl' })
  await page.goto(`/patients/${patient.id}/edit`)
  await expect.poll(() => page.locator('a[href="/patients"][aria-current="location"]').count()).toBeGreaterThan(0)
})

test('normal textarea keyboard input survives shared card wrappers without submitting', async ({ page }, info) => {
  const { patient } = await setup(page, info, 'إدخال اصطناعي')
  await page.goto(`/patients/${patient.id}/visits/new`)
  const complaint = page.getByLabel('الشكوى الرئيسية', { exact: false }); await expect(complaint).toBeEditable({ timeout: 15000 })
  await complaint.fill('نص'); await complaint.press('Space'); await complaint.press('Enter'); await complaint.press('a')
  await expect(complaint).toHaveValue('نص \na'); await expect(page).toHaveURL(new RegExp(`/patients/${patient.id}/visits/new$`))
})

test('failed edit hydration exposes retry and cannot send a blank write', async ({ page }, info) => {
  const { patient } = await setup(page, info, 'تحميل اصطناعي')
  let writes = 0
  page.on('request', request => { if (request.url().endsWith(`/patients/${patient.id}/`) && ['PATCH', 'PUT'].includes(request.method())) writes++ })
  const openingRecord = url => url.pathname === `/api/v1/patients/${patient.id}/`
  await page.route(openingRecord, route => route.request().method() === 'GET'
    ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Synthetic unavailable opening record' } }) })
    : route.continue())
  await page.goto(`/patients/${patient.id}/edit`)
  await expect(page.getByText('تعذر تحميل البيانات؛ أعد المحاولة قبل الحفظ', { exact: false })).toBeVisible()
  await expect(page.locator('form fieldset')).toHaveAttribute('disabled', ''); await expect(page.getByRole('textbox', { name: 'الاسم الأول', exact: true })).toBeDisabled(); expect(writes).toBe(0)
  await page.unroute(openingRecord)
  await page.getByRole('button', { name: 'إعادة المحاولة', exact: true }).click()
  await expect(page.locator('form fieldset')).not.toHaveAttribute('disabled'); await expect(page.getByRole('textbox', { name: 'الاسم الأول', exact: true })).toBeEnabled(); expect(writes).toBe(0)
})

test('scratchpad has no browser persistence and rendered motion respects reduced-motion preference', async ({ page }) => {
  await login(page); await page.emulateMedia({ reducedMotion: 'reduce' })
  const notes = page.getByRole('textbox', { name: 'ملاحظات سريعة' }); await expect(notes).toBeVisible(); await notes.fill('Synthetic private scratchpad')
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('dashboard_notes_')))).toEqual([])
  const animated = await page.locator('.kpi').first().evaluate(element => ({ duration: getComputedStyle(element).animationDuration, transition: getComputedStyle(element).transitionDuration }))
  expect(animated.duration.split(',').every(value => parseFloat(value) <= 0.001)).toBe(true)
  expect(animated.transition.split(',').every(value => parseFloat(value) <= 0.001)).toBe(true)
  await page.reload(); await expect(page.getByRole('textbox', { name: 'ملاحظات سريعة' })).toHaveValue('')
})
