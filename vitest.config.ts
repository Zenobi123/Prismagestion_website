import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Configuration distincte de vite.config.ts, et c'est voulu : la config de
// build charge la PWA, le tagger Lovable et l'injection de CSP, dont les
// tests n'ont que faire. Seuls les alias doivent rester en phase.
export default defineConfig({
  // Nécessaire depuis que des composants sont rendus dans les tests : sans le
  // plugin React, le JSX des fichiers .tsx testés n'est pas transformé.
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
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
