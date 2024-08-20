import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from 'tailwindcss'
import path from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy' // Add this import

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects', // Source file
          dest: '' // Destination in dist folder
        }
      ]
    })
  ],
  base: '/',
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src')
    }
  }
})
