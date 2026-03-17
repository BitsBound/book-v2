import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/book-v2/',
  server: { port: 4200 },
  assetsInclude: ['**/*.md']
});
