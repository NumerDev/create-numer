import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'node', // or change to 'jsdom' and add dockblock to change the environment if needed
    testTimeout: 10_000,

    setupFiles: './src/config/setupTests.tsx',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'src/config'],
    },
  },
}));
