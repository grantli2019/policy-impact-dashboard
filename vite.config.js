import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React 核心运行时
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler/')) {
            return 'vendor';
          }
          // 状态管理
          if (id.includes('node_modules/zustand')) {
            return 'vendor';
          }
          // 政策数据模块（拆分为 core/content/topics/news/life/quiz/gamification/signals）
          // 统一放入独立 chunk 并行加载，不阻塞主 JS
          if (id.includes('src/data/') && !id.includes('node_modules')) {
            return 'policy-data';
          }
          // 工具计算器（懒加载）
          if (id.includes('src/Tools')) {
            return 'tools';
          }
        },
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    // 构建目标
    target: 'es2020',
    // 资源内联阈值：小于 4KB 的资源内联为 base64
    assetsInlineLimit: 4096,
  },
})
