import { defineConfig } from 'vitest/config';

export default defineConfig({
  css: {
    postcss: { plugins: [] }, // backend tests never touch CSS; skip root postcss.config.js lookup
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false, // all tests share one sqlite file; run sequentially
  },
});
