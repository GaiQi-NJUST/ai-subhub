import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 关键配置：确保在 GitHub Pages 任意目录均可无缝访问
})
