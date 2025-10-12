import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
   server: {
    proxy: {
      // 匹配所有以 /api 开头的请求
      '/api': {
        target: 'http://localhost:8082', // 后端接口地址
        changeOrigin: true, // 开启代理，模拟跨域
        rewrite: (path) => path.replace(/^\/api/, '') // 去掉请求路径中的 /api 前缀
      }
    }
  },
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
