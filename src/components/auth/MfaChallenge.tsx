import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck } from 'lucide-react';
import { facteurVerifie, useFacteursMfa } from '@/hooks/useMfa';

interface MfaChallengeProps {
  /** Appelé après une vérification réussie, pour relire le niveau d'assurance. */
  onReussite: () => void;
}

const LONGUEUR_CODE = 6;

/**
 * Demande le code à usage unique lorsqu'un compte a inscrit un second facteur
 * mais ne l'a pas encore présenté sur cette session.
 *
 * L'écran propose toujours une déconnexion : sans cette issue, un
 * administrateur qui perdrait son application d'authentification resterait
 * coincé sur une page dont il ne peut ni sortir ni se déconnecter.
 */
export function MfaChallenge({ onReussite }: MfaChallengeProps) {
  const { signOut } = useAuth();
  const { facteurs, chargement } = useFacteursMfa();
  const [code, setCode] = useState('');
  const [verification, setVerification] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const facteur = facteurVerifie(facteurs);

  // Un code complet se valide sans attendre un clic.
  useEffect(() => {
    if (code.length === LONGUEUR_CODE && !verification) {
      valider();
    }
    // `valider` est stable pour la durée du montage ; l'inclure relancerait
    // la vérification à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const valider = async () => {
    if (!facteur || code.length !== LONGUEUR_CODE) return;

    setVerification(true);
    setErreur(null);

    try {
      const { data: defi, error: erreurDefi } = await supabase.auth.mfa.challenge({
        factorId: facteur.id,
      });
      if (erreurDefi) throw erreurDefi;

      const { error: erreurVerif } = await supabase.auth.mfa.verify({
        factorId: facteur.id,
        challengeId: defi.id,
        code,
      });
      if (erreurVerif) throw erreurVerif;

      onReussite();
    } catch {
      // Le message reste volontairement vague : distinguer « code faux » de
      // « code expiré » renseignerait autant l'attaquant que l'utilisateur.
      setErreur('Code incorrect ou expiré. Regardez le code affiché maintenant par votre application.');
      setCode('');
    } finally {
      setVerification(false);
    }
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2E1A47]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#2E1A47]" />
            <CardTitle>Vérification en deux étapes</CardTitle>
          </div>
          <CardDescription>
            Saisissez le code à {LONGUEUR_CODE} chiffres affiché par votre application
            d'authentification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!facteur ? (
            <Alert variant="destructive">
              <AlertDescription>
                Aucun second facteur exploitable n'a été trouvé sur ce compte. Déconnectez-vous
                puis reconnectez-vous ; si le problème persiste, retirez le facteur depuis le
                tableau de bord Supabase.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code-mfa">Code de vérification</Label>
                <Input
                  id="code-mfa"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, LONGUEUR_CODE))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.4em] h-14"
                  disabled={verification}
                />
              </div>

              {erreur && (
                <Alert variant="destructive">
                  <AlertDescription>{erreur}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={valider}
                disabled={code.length !== LONGUEUR_CODE || verification}
                className="w-full"
              >
                {verification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Vérifier
              </Button>
            </>
          )}

          <Button variant="ghost" onClick={signOut} className="w-full">
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default MfaChallenge;
