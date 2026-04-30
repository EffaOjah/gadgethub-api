import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/controllers/**', 'src/utils/**'],
      exclude: ['src/__mocks__/**', 'src/tests/**'],
    },
  },
});
