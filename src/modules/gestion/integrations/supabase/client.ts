// Le module de gestion partage le client Supabase de l'application hôte.
//
// Instancier un second client créerait une deuxième instance GoTrue sur le
// même domaine : les deux se disputeraient la clé de session dans
// localStorage, et se connecter au site déconnecterait la console (ou
// l'inverse). Une seule instance, donc une seule session.
//
// Le client de l'hôte est exposé en `any` parce qu'il bascule sur un backend
// localStorage lorsque Supabase n'est pas configuré. On le retype ici avec
// les tables générées et celles déclarées à la main dans extraTables.ts, ce
// qui préserve le typage dont dépendent les services du module.

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as hostSupabase } from '@/integrations/supabase/client';
import type { Database as GeneratedDatabase } from './types';
import type { ExtraTables } from './extraTables';

type Database = GeneratedDatabase & {
  public: GeneratedDatabase['public'] & {
    Tables: GeneratedDatabase['public']['Tables'] & ExtraTables;
  };
};

// Import the supabase client like this:
// import { supabase } from "@gestion/integrations/supabase/client";

export const supabase = hostSupabase as SupabaseClient<Database>;
