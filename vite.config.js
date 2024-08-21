import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from 'tailwindcss'
import path from 'path'
import { fileURLToPath } from 'url' // Import fileURLToPath
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig({
  plugins: [vue(), vueJsx(), VueDevTools()],
  base: '/',
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      'source-map-js': 'source-map',
      path: 'rollup-plugin-node-polyfills/polyfills/path',
      url: 'rollup-plugin-node-polyfills/polyfills/url'
    }
  },
  optimizeDeps: {
    exclude: ['fs']
  }
})
