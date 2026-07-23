
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { AnalyticsService } from '@/services/analyticsService'

// Suivi analytique global (GA4 via VITE_GA_ID, ou Plausible via
// VITE_PLAUSIBLE_DOMAIN). Sans configuration, l'appel est sans effet.
AnalyticsService.initialize()

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
