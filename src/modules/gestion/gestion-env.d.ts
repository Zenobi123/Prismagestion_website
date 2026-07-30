// Extensions de l'objet Window propres à la console de gestion.
//
// Ces déclarations vivaient dans le vite-env.d.ts de l'application
// autonome. Le module n'a plus de vite-env.d.ts à lui : la directive
// `/// <reference types="vite/client" />` est déjà fournie une fois par
// l'hôte, et la déclarer deux fois n'apporte rien.
//
// Les caches fiscaux sont posés sur `window` pour rester accessibles
// entre des composants qui ne partagent pas d'arbre React commun.

interface Window {
  __invalidateFiscalCaches?: () => void;
  __patenteCacheTimestamp?: number;
  __dsfCacheTimestamp?: number;
  __dsfCacheData?: unknown[] | null;
  __darpCacheTimestamp?: number;
  __igsCache?: {
    data: null | unknown;
    timestamp: number;
  };

  // Invalidation unifiée de tous les caches fiscaux.
  __invalidateAllCaches?: () => void;
}
