// vite.config.js
import { defineConfig } from "file:///C:/Users/User/Documents/GitHub/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/User/Documents/GitHub/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/User/Documents/GitHub/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import VueDevTools from "file:///C:/Users/User/Documents/GitHub/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import tailwindcss from "file:///C:/Users/User/Documents/GitHub/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/node_modules/tailwindcss/lib/index.js";
import path from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/User/Documents/GitHub/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/vite.config.js";
var filename = fileURLToPath(__vite_injected_original_import_meta_url);
var dirname = path.dirname(filename);
var vite_config_default = defineConfig({
  base: "./",
  root: "src",
  plugins: [
    vue(),
    // Add the Vue plugin here
    vueJsx(),
    VueDevTools()
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "./src/assets",
    rollupOptions: {
      input: path.resolve(dirname, "./src/index.html")
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      "source-map-js": "source-map",
      path: "rollup-plugin-node-polyfills/polyfills/path",
      url: "rollup-plugin-node-polyfills/polyfills/url"
    }
  },
  optimizeDeps: {
    exclude: ["fs"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcQ09TMzAxLVNFLTIwMjRcXFxcRXh0ZW5kZWQtUGxhbm5pbmctSW5zdHJ1bWVudC1mb3ItVW5wcmVkaWN0YWJsZS1TcGFjZXMtYW5kLUVudmlyb25tZW50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXNlclxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXENPUzMwMS1TRS0yMDI0XFxcXEV4dGVuZGVkLVBsYW5uaW5nLUluc3RydW1lbnQtZm9yLVVucHJlZGljdGFibGUtU3BhY2VzLWFuZC1FbnZpcm9ubWVudHNcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VzZXIvRG9jdW1lbnRzL0dpdEh1Yi9DT1MzMDEtU0UtMjAyNC9FeHRlbmRlZC1QbGFubmluZy1JbnN0cnVtZW50LWZvci1VbnByZWRpY3RhYmxlLVNwYWNlcy1hbmQtRW52aXJvbm1lbnRzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcclxuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJ1xyXG5cclxuY29uc3QgZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybClcclxuY29uc3QgZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlbmFtZSlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogJy4vJyxcclxuICByb290OiAnc3JjJyxcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSwgLy8gQWRkIHRoZSBWdWUgcGx1Z2luIGhlcmVcclxuICAgIHZ1ZUpzeCgpLFxyXG4gICAgVnVlRGV2VG9vbHMoKVxyXG4gIF0sXHJcbiAgY3NzOiB7XHJcbiAgICBwb3N0Y3NzOiB7XHJcbiAgICAgIHBsdWdpbnM6IFt0YWlsd2luZGNzcygpXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJy4uL2Rpc3QnLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICBhc3NldHNEaXI6ICcuL3NyYy9hc3NldHMnLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBpbnB1dDogcGF0aC5yZXNvbHZlKGRpcm5hbWUsICcuL3NyYy9pbmRleC5odG1sJylcclxuICAgIH1cclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKGRpcm5hbWUsICcuL3NyYycpLFxyXG4gICAgICAnc291cmNlLW1hcC1qcyc6ICdzb3VyY2UtbWFwJyxcclxuICAgICAgcGF0aDogJ3JvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3BhdGgnLFxyXG4gICAgICB1cmw6ICdyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy91cmwnXHJcbiAgICB9XHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGV4Y2x1ZGU6IFsnZnMnXVxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0aEIsU0FBUyxvQkFBb0I7QUFDempCLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBTitULElBQU0sMkNBQTJDO0FBUTlZLElBQU0sV0FBVyxjQUFjLHdDQUFlO0FBQzlDLElBQU0sVUFBVSxLQUFLLFFBQVEsUUFBUTtBQUVyQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUE7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixPQUFPLEtBQUssUUFBUSxTQUFTLGtCQUFrQjtBQUFBLElBQ2pEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsU0FBUyxPQUFPO0FBQUEsTUFDbEMsaUJBQWlCO0FBQUEsTUFDakIsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsSUFBSTtBQUFBLEVBQ2hCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
