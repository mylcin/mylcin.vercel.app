import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Unit tests cover pure modules (i18n, content loaders, console engine).
// Pages are async Server Components, which Vitest cannot render.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@content': path.resolve(import.meta.dirname, 'content'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'content/**/*.test.ts'],
  },
});
