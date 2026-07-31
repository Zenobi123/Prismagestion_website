import { defineConfig } from 'vitest/config';
import path from 'path';

// Configuration distincte de vite.config.ts, et c'est voulu : la config de
// build charge la PWA, le tagger Lovable et l'injection de CSP, dont les
// tests n'ont que faire. Seuls les alias doivent rester en phase.
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      // Même précaution que dans vite.config.ts : "@gestion" doit précéder
      // "@", sinon "@gestion/x" serait résolu comme "@" + "gestion/x".
      '@gestion': path.resolve(__dirname, './src/modules/gestion'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
