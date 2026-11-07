import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  base: '/static/',
  publicDir: 'public',   // Changed from 'public/static' to serve static assets correctly
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components/ui', 'src/components/common'],
      extensions: ['vue'],
      dts: 'src/components.d.ts',
      directoryAsNamespace: false,
      deep: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5019',
        changeOrigin: true
      }
    }
  },
  build: {
    minify: false,
    sourcemap: true,
    cssMinify: false,
  },
})