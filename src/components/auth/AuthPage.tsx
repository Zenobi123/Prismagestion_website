
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';

// Freinage des tentatives répétées, repris de l'écran de connexion de la
// console de gestion avant sa fusion dans le site.
//
// À prendre pour ce que c'est : un garde-fou côté navigateur, effaçable en
// vidant sessionStorage ou en changeant de navigateur. Il décourage un
// essai manuel, pas un script. Les vraies barrières sont ailleurs — la
// limitation de débit de Supabase Auth, la politique de mots de passe et
// la vérification des mots de passe compromis, à activer côté projet.
const MAX_TENTATIVES = 5;
const DUREE_VERROU_MS = 60_000;
const CLE_VERROU = 'auth_verrou_jusqua';
const CLE_TENTATIVES = 'auth_tentatives';

type EtatVerrou = { verrouille: boolean; restantMs: number };

function lireEtatVerrou(): EtatVerrou {
  const verrouJusqua = sessionStorage.getItem(CLE_VERROU);
  if (!verrouJusqua) return { verrouille: false, restantMs: 0 };

  const restant = parseInt(verrouJusqua, 10) - Date.now();
  if (restant > 0) return { verrouille: true, restantMs: restant };

  // Verrou expiré : on repart d'un compteur vierge.
  sessionStorage.removeItem(CLE_VERROU);
  sessionStorage.removeItem(CLE_TENTATIVES);
  return { verrouille: false, restantMs: 0 };
}

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verrouille, setVerrouille] = useState(() => lireEtatVerrou().verrouille);
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Après connexion, on revient à la page initialement demandée
  // (mémorisée par ProtectedRoute), ou à la console admin par défaut.
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/admin';

  // Le verrou doit se lever tout seul à l'expiration, sans rechargement.
  useEffect(() => {
    const etat = lireEtatVerrou();
    setVerrouille(etat.verrouille);
    if (!etat.verrouille || etat.restantMs <= 0) return;

    const minuterie = setTimeout(() => {
      setVerrouille(false);
      sessionStorage.removeItem(CLE_VERROU);
      sessionStorage.removeItem(CLE_TENTATIVES);
    }, etat.restantMs);
    return () => clearTimeout(minuterie);
  }, [verrouille]);

  const enregistrerEchec = useCallback(() => {
    const tentatives = parseInt(sessionStorage.getItem(CLE_TENTATIVES) || '0', 10) + 1;
    sessionStorage.setItem(CLE_TENTATIVES, String(tentatives));

    if (tentatives >= MAX_TENTATIVES) {
      sessionStorage.setItem(CLE_VERROU, String(Date.now() + DUREE_VERROU_MS));
      setVerrouille(true);
      toast({
        title: 'Trop de tentatives',
        description: `Connexion suspendue pendant ${DUREE_VERROU_MS / 1000} secondes.`,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: "Erreur d'authentification",
      description: `Identifiants incorrects. ${MAX_TENTATIVES - tentatives} tentative(s) avant suspension.`,
      variant: 'destructive',
    });
  }, [toast]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verrouille) return;
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        enregistrerEchec();
      } else {
        sessionStorage.removeItem(CLE_TENTATIVES);
        sessionStorage.removeItem(CLE_VERROU);
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue !',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur inattendue s'est produite.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2E1A47]">
            Connexion
          </CardTitle>
          <CardDescription>
            Espace réservé au cabinet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verrouille && (
            <Alert variant="destructive" className="mb-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                Trop de tentatives infructueuses. Réessayez dans une minute.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={verrouille}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={verrouille}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#2E1A47] hover:bg-[#2E1A47]/90"
              disabled={isLoading || verrouille}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>

          {/* Aucun formulaire d'inscription : les comptes du cabinet sont
              créés depuis la console Supabase, puis dotés d'un rôle dans
              user_roles — sans quoi ils n'accèdent à aucune donnée. */}
          <p className="mt-4 text-center text-sm text-gray-500">
            Les accès sont attribués par l'administrateur du cabinet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
