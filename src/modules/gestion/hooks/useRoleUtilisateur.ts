import { useEffect, useState } from "react";
import { supabase } from "@gestion/integrations/supabase/client";

/**
 * Rôle de l'utilisateur courant, lu dans `public.user_roles`.
 *
 * C'est la **seule** source d'autorisation de l'application. Les politiques RLS
 * de toutes les tables métier s'appuient sur cette même table, via
 * `private.has_role()` ; l'écran de connexion et le `ProtectedRoute requireAdmin`
 * de l'hôte aussi.
 *
 * La console lisait auparavant `public.users.role`, une seconde source dont les
 * politiques UPDATE laissaient l'utilisateur réécrire sa propre ligne — donc son
 * propre rôle (audit du 18/08/2026, constats 1 et 2). Cette colonne est désormais
 * inaccessible en écriture et n'autorise plus rien : ne pas y revenir.
 *
 * `user_roles` n'a pas de ligne pour un utilisateur sans rôle attribué ; le hook
 * renvoie alors `null`, qui n'ouvre aucun menu.
 */
export function useRoleUtilisateur() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let actif = true;

    const lireRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (actif) setRole(null);
          return;
        }

        // `maybeSingle` et non `single` : l'absence de rôle est un cas normal,
        // pas une erreur à remonter.
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (actif) setRole(data?.role ?? null);
      } finally {
        if (actif) setIsLoading(false);
      }
    };

    lireRole();

    return () => {
      actif = false;
    };
  }, []);

  return { role, isLoading };
}
