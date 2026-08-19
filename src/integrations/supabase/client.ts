// Client de données du site.
//
// - Si VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY sont définis,
//   le vrai client Supabase est utilisé (base partagée, temps réel,
//   stockage, authentification).
// - Sinon, un backend local (localStorage) qui reproduit la même API
//   prend le relais : le site reste entièrement fonctionnel hors ligne
//   ou sans configuration (voir src/lib/localBackend/).
//
// Tous les imports existants
// (`import { supabase } from "@/integrations/supabase/client"`)
// fonctionnent à l'identique dans les deux modes.

import { createClient } from '@supabase/supabase-js';
import { localBackendClient } from '@/lib/localBackend/client';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Le build de production refuse désormais de produire un paquet dans cet état
// (voir `garderContreLeBackendLocalEnProduction` dans vite.config.ts). Le
// signal reste utile pour les deux échappatoires assumées : il rappelle que
// l'authentification affichée n'en est pas une.
//
// `console.error` et non `console.warn` : la configuration esbuild retire les
// seconds du bundle de production, précisément là où l'avertissement compte.
if (!isSupabaseConfigured) {
  console.error(
    "[supabase] Aucune configuration détectée : backend local (localStorage) actif. " +
      "Les comptes et les rôles sont factices — ne jamais servir cet état en production.",
  );
}

export const supabase = (isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : localBackendClient) as any;

export type { User, Session } from '@supabase/supabase-js';
