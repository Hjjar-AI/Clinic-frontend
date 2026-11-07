import { defineConfig } from '@playwright/test'

const python = process.env.CLINIC_TEST_PYTHON || 'python3'
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: '.test-artifacts/playwright',
  fullyParallel: false, workers: 1, retries: 0,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5174', browserName: 'chromium',
    locale: 'ar-SY', timezoneId: 'Asia/Damascus',
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    {
      command: `"${python}" -B ../backend/tests/browser_server.py`,
      url: 'http://127.0.0.1:5018/api/v1/auth/config/',
      timeout: 120000, reuseExistingServer: false,
    },
    {
      command: 'pnpm exec vite --config vite.e2e.config.js',
      url: 'http://127.0.0.1:5174/static/',
      timeout: 120000, reuseExistingServer: false,
    },
  ],
})
