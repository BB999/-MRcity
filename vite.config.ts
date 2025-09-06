import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // HTTPSは本番環境でのみ有効にする（開発時は証明書エラーを避けるため）
    // WebXRを本格的に使う場合は、信頼できる証明書が必要
    https: false,
    host: true,
    port: 3000
  }
})