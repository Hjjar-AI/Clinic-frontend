import { it, expect } from 'vitest'

// Transform/import every routed feature view. Behavior is covered separately;
// this detects broken SFC syntax, aliases, static imports and auto-imports.
const views = import.meta.glob('/src/features/**/views/*.vue')
it('all feature views transform and resolve their production imports', async () => {
  expect(Object.keys(views).length).toBeGreaterThan(30)
  for (const [path, load] of Object.entries(views)) {
    const module = await load()
    expect(module.default, path).toBeDefined()
  }
}, 60000)
