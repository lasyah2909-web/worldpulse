import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gnews': {
        target: 'https://gnews.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gnews/, ''),
      },
    },
  },
})
