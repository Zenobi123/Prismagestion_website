
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@gestion/components/ui/use-toast";
import { supabase } from "@gestion/integrations/supabase/client";

export type AuthorizedModule = "collaborateurs" | "parametres" | "facturation" | "clients" | "gestion" | "missions" | "planning" | "courrier" | "rapports" | "dashboard" | "aide" | "outils";

interface UseAuthorizationOptions {
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * Hook pour gérer les autorisations d'accès aux modules protégés.
 * Vérifie le rôle côté serveur via Supabase (et non via localStorage).
 */
export const useAuthorization = (
  authorizedRoles: string[],
  module: AuthorizedModule,
  options: UseAuthorizationOptions = {}
) => {
  const { redirectTo = "/", showToast = true } = options;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          // L'hôte expose l'écran de connexion sur /auth ; la route /login
          // de l'application autonome n'existe plus.
          navigate("/auth");
          return;
        }

        // Le rôle est lu dans `user_roles`, la seule source d'autorisation :
        // c'est celle sur laquelle s'appuient toutes les politiques RLS. La
        // console interrogeait auparavant `users.role`, que son propriétaire
        // pouvait réécrire (audit du 18/08/2026, constats 1 et 2).
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        // Sans rôle attribué, aucun module n'est accessible.
        if (error || !roleData) {
          navigate(redirectTo);
          return;
        }

        const role = roleData.role;
        setUserRole(role);
        const authorized = authorizedRoles.includes(role);
        setIsAuthorized(authorized);

        if (!authorized) {
          if (showToast) {
            const moduleNames: Record<AuthorizedModule, string> = {
              collaborateurs: "la gestion des collaborateurs",
              parametres: "la gestion des paramètres du système",
              facturation: "la gestion de la facturation",
              clients: "la gestion des clients",
              gestion: "la gestion des dossiers clients",
              missions: "la gestion des missions",
              planning: "le planning",
              courrier: "la gestion du courrier",
              rapports: "les rapports",
              dashboard: "le tableau de bord",
              aide: "l'aide",
              outils: "les outils pratiques",
            };

            toast({
              variant: "destructive",
              title: "Accès non autorisé",
              description: `Seuls les administrateurs peuvent accéder à ${moduleNames[module]}.`
            });
          }

          navigate(redirectTo);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [authorizedRoles, module, navigate, toast, showToast, redirectTo]);

  return { isAuthorized, userRole, isLoading };
};
