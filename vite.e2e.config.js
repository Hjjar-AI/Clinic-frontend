import { defineConfig } from 'vite'
import testConfig from './vitest.config.js'

export default defineConfig({
  base: '/',
  plugins: testConfig.plugins,
  resolve: testConfig.resolve,
  server: {
    host: '127.0.0.1', port: 5174, strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:5018', changeOrigin: true } },
  },
})
