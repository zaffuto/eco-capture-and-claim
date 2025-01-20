import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@eco/ui': path.resolve(__dirname, './packages/ui/src'),
      '@eco/shared': path.resolve(__dirname, './packages/shared/src'),
      '@eco/database': path.resolve(__dirname, './packages/database/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});