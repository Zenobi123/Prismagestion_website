
import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { usePWAUpdate } from '@/components/PWAUpdater';

// Eager-load the Index page for faster initial render
import Index from './pages/Index';

// Lazy-load other pages
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));
const Outils = lazy(() => import('./pages/Outils'));
const CalculateurImpots = lazy(() => import('./pages/CalculateurImpots'));
const CalculateurFraisMarche = lazy(() => import('./pages/CalculateurFraisMarche'));
const ExpertiseDigitale = lazy(() => import('./pages/ExpertiseDigitale'));
const AuthPage = lazy(() => import('./components/auth/AuthPage'));
// Console de gestion du cabinet, montée comme module invité de l'espace admin.
const GestionModule = lazy(() => import('./modules/gestion/GestionModule'));

// Component for route-specific loading states
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-12 w-12 border-t-4 border-b-4 border-prisma-purple rounded-full"></div>
  </div>
);

/**
 * Préchargement des routes que le visiteur a des chances d'ouvrir ensuite.
 *
 * Le module d'administration était précédemment préchargé pour tout le monde :
 * avec ses dépendances (graphiques, génération de PDF), cela représentait plus
 * d'un mégaoctet téléchargé par des visiteurs qui n'y ont pas accès. Il est
 * désormais chargé à la demande, au moment où la route est ouverte — les
 * administrateurs authentifiés paient une attente d'une fraction de seconde,
 * le public ne paie plus rien.
 *
 * Le blog reste préchargé : c'est une destination publique plausible depuis
 * l'accueil. Le préchargement est abandonné si le navigateur signale un forfait
 * limité ou une connexion lente.
 */
const prefetchRoutes = () => {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  if (connection?.saveData) return;
  if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return;

  setTimeout(() => {
    void import('./pages/Blog');
  }, 3000);
};

function App() {
  // Start prefetching routes after initial load
  useEffect(() => {
    prefetchRoutes();
  }, []);

  usePWAUpdate();

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/auth" element={<AuthPage />} />
              {/* Déclarée avant /admin/* par lisibilité : React Router v6
                  choisit de toute façon la route la plus spécifique. */}
              <Route
                path="/admin/gestion/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <GestionModule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/outils" element={<Outils />} />
              <Route path="/outils/calculateur-impots" element={<CalculateurImpots />} />
              <Route path="/outils/calculateur-frais-marche" element={<CalculateurFraisMarche />} />
              <Route path="/expertise/ia-et-genie-logiciel" element={<ExpertiseDigitale />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
