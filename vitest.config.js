import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  cacheDir: process.env.CLINIC_VITEST_CACHE || '/tmp/clinic-vitest-cache',
  plugins: [
    vue(),
    AutoImport({ imports: ['vue', 'vue-router', 'pinia'], dts: false }),
    Components({ dirs: ['src/components/ui', 'src/components/common'], deep: false, dts: false }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom', include: ['tests/components/**/*.spec.js'],
    setupFiles: ['tests/components/setup.js'], maxWorkers: 1,
    clearMocks: true, restoreMocks: true, testTimeout: 15000,
  },
})
