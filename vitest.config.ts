import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 30000, // 30 segundos para operações de banco real
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://borjwewtuphjpztglslo.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcmp3ZXd0dXBoanB6dGdsc2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjM5NTcsImV4cCI6MjA3ODczOTk1N30.gZc8vzw1M7zTfFofkI7Grg5U07R22HMi4b4CU0sgbHk'),
  },
});
