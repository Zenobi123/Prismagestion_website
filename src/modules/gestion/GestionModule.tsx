// Point de montage de la console de gestion dans le site vitrine.
//
// Ce composant remplace l'ancien App.tsx de l'application autonome
// (conservé en App.tsx.reference le temps de la migration). Trois
// différences tiennent à son nouveau statut de module invité :
//
//   1. Pas de <BrowserRouter> : l'hôte en fournit déjà un. Les chemins
//      déclarés ici sont relatifs et se greffent sous /admin/gestion.
//   2. Pas de <PrivateRoute> ni de route /login : l'accès est déjà filtré
//      en amont par le <ProtectedRoute requireAdmin> de l'hôte.
//   3. Un QueryClient dédié. L'hôte en monte un avec les réglages par
//      défaut ; la console a besoin des siens (cache long, pas de refetch
//      au retour de focus) sous peine de rafraîchir en boucle des données
//      fiscales coûteuses à calculer. Les deux caches ne se recouvrent pas :
//      le site vitrine ne lit aucune des tables métier du cabinet.

import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@gestion/components/ui/tooltip';
import { Toaster } from '@gestion/components/ui/toaster';
import { Toaster as Sonner } from '@gestion/components/ui/sonner';
import { ExerciceProvider } from '@gestion/contexts/ExerciceContext';
import { DocumentPreviewProvider } from '@gestion/components/printable/DocumentPreviewProvider';

// Première tranche de pages montées. Les autres (facturation, gestion,
// courrier, missions, planning, collaborateurs, rapports, paramètres,
// outils) suivront une fois la navigation et l'authentification validées.
const Index = lazy(() => import('@gestion/pages/Index'));
const Clients = lazy(() => import('@gestion/pages/Clients'));
const Aide = lazy(() => import('@gestion/pages/Aide'));
const NotFound = lazy(() => import('@gestion/pages/NotFound'));

const gestionQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

const ModuleLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const GestionModule = () => (
  <QueryClientProvider client={gestionQueryClient}>
    <TooltipProvider>
      <ExerciceProvider>
        <DocumentPreviewProvider>
          <Suspense fallback={<ModuleLoader />}>
            <Routes>
              <Route index element={<Index />} />
              <Route path="clients" element={<Clients />} />
              <Route path="aide" element={<Aide />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
          <Sonner />
        </DocumentPreviewProvider>
      </ExerciceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default GestionModule;
