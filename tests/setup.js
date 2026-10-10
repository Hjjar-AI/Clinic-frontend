// Use the installed Vue/Pinia runtime; resolve only Vite aliases/extensions/env.
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as vue from 'vue'
import * as pinia from 'pinia'
import * as router from 'vue-router'
const root = new URL('../', import.meta.url)
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('@/')) specifier = new URL(`src/${specifier.slice(2)}`, root).href
    if ((specifier.startsWith('file:') || specifier.startsWith('.')) && !context.parentURL?.includes('/node_modules/')) {
      const url = new URL(specifier, context.parentURL || root)
      if (!/\.[a-z]+$/i.test(url.pathname)) {
        if (existsSync(fileURLToPath(`${url.href}.js`))) specifier = `${url.href}.js`
        else if (existsSync(fileURLToPath(`${url.href}/index.js`))) specifier = `${url.href}/index.js`
      }
    }
    return next(specifier, context)
  },
  load(url, context, next) {
    const result = next(url, context)
    if (url.startsWith(new URL('src/', root).href) && url.endsWith('.js')) {
      return { ...result, source: String(result.source).replaceAll('import.meta.env', '({ DEV: false, MODE: "test" })') }
    }
    return result
  },
})
// Vite's auto-import plugin supplies these names in production.
Object.assign(globalThis, vue, pinia, router)
class MemoryStorage {
  values = new Map()
  get length() { return this.values.size }
  key(index) { return [...this.values.keys()][index] ?? null }
  getItem(key) { return this.values.get(String(key)) ?? null }
  setItem(key, value) { this.values.set(String(key), String(value)) }
  removeItem(key) { this.values.delete(String(key)) }
  clear() { this.values.clear() }
}
const windowDouble = new EventTarget()
Object.assign(windowDouble, {
  location: { href: 'http://clinic.test/patients/new', pathname: '/patients/new' },
  localStorage: new MemoryStorage(), sessionStorage: new MemoryStorage(),
  innerWidth: 1024, innerHeight: 768, __announce() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
})
globalThis.window = windowDouble
globalThis.localStorage = windowDouble.localStorage
globalThis.sessionStorage = windowDouble.sessionStorage
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true, language: 'ar-SY' }, configurable: true })
const documentDouble = new EventTarget()
Object.assign(documentDouble, {
  cookie: '', activeElement: null,
  body: { style: {}, appendChild() {}, children: [] },
  documentElement: { dir: 'rtl', style: {}, classList: { add() {}, remove() {}, toggle() {} } },
  getElementById: () => null,
  createElement: () => ({ style: {}, setAttribute() {}, remove() {}, textContent: '' }),
})
globalThis.document = documentDouble
