import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup-test-env.ts'],
    include: ['./app/**/*.test.{ts,tsx}', './test/**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
    },
  },
}); 