// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: './', // 支持 file:// 加载
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'web-dist', // ✅ 输出目录设置为 web-dist
    sourcemap: false, // 不生成 map 文件
    cssCodeSplit: true, // 分离 CSS 文件
  }
})
