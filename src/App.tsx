
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
const ExpertiseDigitale = lazy(() => import('./pages/ExpertiseDigitale'));
const AuthPage = lazy(() => import('./components/auth/AuthPage'));

// Component for route-specific loading states
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-12 w-12 border-t-4 border-b-4 border-prisma-purple rounded-full"></div>
  </div>
);

// Prefetch important routes
const prefetchRoutes = () => {
  // Prefetch Admin module in background after 3 seconds on homepage
  setTimeout(() => {
    const prefetchAdmin = import('./pages/Admin');
    const prefetchBlog = import('./pages/Blog');
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
