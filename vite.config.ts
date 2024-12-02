import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  },
  define: {
    'process.env': {}
  },
  publicDir: 'public',
  assetsInclude: ['**/*.mp3']
});