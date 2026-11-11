import { expect, test } from '@playwright/test'
import { setup } from './helpers/workflow.js'

const themes = ['default', 'prussian-orange', 'vanilla-tangerine', 'ink-wheat-burnt', 'deep-space-strawberry', 'ocean-cerulean', 'rosewood-crimson', 'dusk-dusty-rosewood']

test('patient layout keeps overflow local across narrow/boundary/wide widths, directions and theme modes', async ({ page }, info) => {
  test.setTimeout(120000)
  await setup(page, info, 'اسم عربي طويل ABC123 لاختبار التفاف خلايا القائمة '.repeat(2))
  await page.goto('/patients')
  await expect(page.locator('.table-wrapper')).toBeVisible()
  const original = page.viewportSize()
  for (const width of [320, 768, 769, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    const failures = await page.evaluate(async themes => {
      const { themeService } = await import('/src/services/themeService.js')
      const root = document.documentElement, shell = document.querySelector('.app-layout')
      const originalDirection = root.dir, originalShellDirection = shell.getAttribute('dir')
      const failures = []
      try {
        for (const direction of ['rtl', 'ltr']) for (const theme of themes) for (const dark of [false, true]) {
          root.dir = direction
          shell.dir = direction
          themeService.apply(theme, dark)
          await new Promise(requestAnimationFrame)
          const overflow = root.scrollWidth - innerWidth
          if (overflow > 2) failures.push({ direction, theme, dark, overflow })
        }
      } finally {
        root.dir = originalDirection
        if (originalShellDirection == null) shell.removeAttribute('dir')
        else shell.setAttribute('dir', originalShellDirection)
        themeService.apply('default', false)
      }
      return failures
    }, themes)
    expect(failures, `page overflow at ${width}px`).toEqual([])
  }
  await page.setViewportSize(original)
})
