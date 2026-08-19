
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { secondFacteurAttendu, useNiveauAssurance } from '@/hooks/useMfa';
import { MfaChallenge } from '@/components/auth/MfaChallenge';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading, error } = useUserRole();
  const assurance = useNiveauAssurance();
  const location = useLocation();

  if (authLoading || roleLoading || assurance.chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E1A47] mx-auto" />
          <p className="mt-2 text-gray-600">
            {requireAdmin ? 'Vérification des permissions...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // On mémorise la page demandée pour y revenir après connexion.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Le compte a inscrit un second facteur mais ne l'a pas encore présenté sur
  // cette session : on réclame le code avant toute page protégée. Un compte
  // sans facteur inscrit passe sans rien voir de tout ceci — l'activation
  // reste volontaire, depuis l'onglet Sécurité de l'administration.
  if (secondFacteurAttendu(assurance)) {
    return <MfaChallenge onReussite={assurance.rafraichir} />;
  }

  if (requireAdmin) {
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors de la vérification des permissions. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (!isAdmin) {
      // Utilisateur connecté mais sans droits admin : on le renvoie à
      // l'accueil (et non vers /auth, ce qui provoquerait une boucle de
      // redirection puisqu'il est déjà authentifié).
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
