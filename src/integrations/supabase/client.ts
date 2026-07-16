// Ce module exposait auparavant un client Supabase distant.
// Le site fonctionne désormais sans backend : il est remplacé par un
// client local (données persistées dans le localStorage du navigateur)
// qui reproduit la même API. Tous les imports existants
// (`import { supabase } from "@/integrations/supabase/client"`)
// continuent de fonctionner à l'identique.

import { localBackendClient } from '@/lib/localBackend/client';

export type { User, Session, AuthChangeEvent, AuthError } from '@/lib/localBackend/client';
export { DEFAULT_ADMIN } from '@/lib/localBackend/client';

export const supabase = localBackendClient as any;
