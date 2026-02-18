import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { dependencies } from './package.json';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    /*
      Dedupe all duplicated dependencies to prevent multiple
      transformations of the same dependency.
    */
    dedupe: [...Object.keys(dependencies)],
  },
  plugins: [react()],
});
