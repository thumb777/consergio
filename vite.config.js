import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /^\/admin/, to: '/index.html' },
        { from: /^\/pending/, to: '/index.html' },
        { from: /^\/success/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    }
  },
  preview: {
    port: 5173,
    historyApiFallback: true
  }
});

