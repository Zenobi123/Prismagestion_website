// Ajoute les matchers DOM de jest-dom à `expect` (toBeInTheDocument,
// toHaveValue, toBeDisabled…) et nettoie le DOM entre deux tests, sans quoi
// les rendus successifs s'empilent et les requêtes deviennent ambiguës.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
