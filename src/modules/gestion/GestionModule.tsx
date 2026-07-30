// Point de montage de la console de gestion dans le site vitrine.
//
// Ce composant remplace l'ancien App.tsx de l'application autonome.
// Trois différences tiennent à son nouveau statut de module invité :
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
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@gestion/components/ui/tooltip';
import { Toaster } from '@gestion/components/ui/toaster';
import { Toaster as Sonner } from '@gestion/components/ui/sonner';
import { ExerciceProvider } from '@gestion/contexts/ExerciceContext';
import { DocumentPreviewProvider } from '@gestion/components/printable/DocumentPreviewProvider';
import MobileBottomNav from '@gestion/components/layout/MobileBottomNav';
// Rétablit la palette d'origine de la console à l'intérieur de .gestion-theme.
import '@gestion/gestion-theme.css';

const Index = lazy(() => import('@gestion/pages/Index'));
const Clients = lazy(() => import('@gestion/pages/Clients'));
const Gestion = lazy(() => import('@gestion/pages/Gestion'));
const Facturation = lazy(() => import('@gestion/pages/Facturation'));
const Courrier = lazy(() => import('@gestion/pages/Courrier'));
const Missions = lazy(() => import('@gestion/pages/Missions'));
const Planning = lazy(() => import('@gestion/pages/Planning'));
const Collaborateurs = lazy(() => import('@gestion/pages/Collaborateurs'));
const CollaborateurDetails = lazy(() => import('@gestion/pages/CollaborateurDetails'));
const CollaborateurEdit = lazy(() => import('@gestion/pages/CollaborateurEdit'));
const Rapports = lazy(() => import('@gestion/pages/Rapports'));
const Parametres = lazy(() => import('@gestion/pages/Parametres'));
const Outils = lazy(() => import('@gestion/pages/Outils'));
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

// Bandeau de liaison : la console est atteinte depuis la barre latérale de
// l'administration du site, il lui faut le chemin de retour. Sans lui, on
// entre dans le module sans pouvoir en ressortir autrement qu'en modifiant
// l'URL. Sticky pour rester atteignable sur les pages longues.
const BandeauRetour = () => (
  <div className="sticky top-0 z-40 bg-[#2E1A47] text-white">
    <div className="flex items-center gap-3 px-4 py-2">
      <Link
        to="/admin"
        className="group inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        Administration du site
      </Link>
      <span className="text-white/25">|</span>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D6DD00]">
        <Building2 size={16} />
        Gestion du cabinet
      </span>
    </div>
  </div>
);

const GestionModule = () => (
  <QueryClientProvider client={gestionQueryClient}>
    <TooltipProvider>
      <ExerciceProvider>
        <DocumentPreviewProvider>
          <BandeauRetour />
          {/* Toute la console vit sous .gestion-theme : ses variables y
              reprennent les valeurs d'origine, sans toucher au site. */}
          <div className="gestion-theme">
          <Suspense fallback={<ModuleLoader />}>
            <Routes>
              <Route index element={<Index />} />
              <Route path="clients" element={<Clients />} />
              <Route path="gestion" element={<Gestion />} />
              <Route path="facturation" element={<Facturation />} />
              <Route path="courrier" element={<Courrier />} />
              <Route path="missions" element={<Missions />} />
              <Route path="planning" element={<Planning />} />
              <Route path="collaborateurs" element={<Collaborateurs />} />
              <Route path="collaborateurs/:id" element={<CollaborateurDetails />} />
              <Route path="collaborateurs/:id/edit" element={<CollaborateurEdit />} />
              <Route path="rapports" element={<Rapports />} />
              <Route path="parametres" element={<Parametres />} />
              <Route path="outils" element={<Outils />} />
              <Route path="aide" element={<Aide />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          {/* Barre de navigation basse, affichée sur mobile uniquement
              (le composant se retire lui-même au-dessus du point de
              rupture). L'ancien App.tsx la conditionnait à la présence
              d'une session : ici, l'hôte l'a déjà garantie. */}
          <MobileBottomNav />
          </div>
          <Toaster />
          <Sonner />
        </DocumentPreviewProvider>
      </ExerciceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default GestionModule;
