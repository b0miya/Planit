import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Actions 환경에서는 GITHUB_REPOSITORY (owner/repo) 자동 설정됨
const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/'

export default defineConfig({
  base,
  plugins: [react()]
})
