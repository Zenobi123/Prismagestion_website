import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import {
  facteurVerifie,
  mfaDisponible,
  nettoyerFacteursNonVerifies,
  useFacteursMfa,
} from '@/hooks/useMfa';

const LONGUEUR_CODE = 6;
const NOM_FACTEUR = "Application d'authentification";

interface InscriptionEnCours {
  factorId: string;
  qrCode: string;
  secret: string;
}

/**
 * Inscription du second facteur (TOTP) pour le compte connecté.
 *
 * L'inscription est volontaire : tant qu'aucun facteur n'est vérifié, la
 * connexion reste inchangée. Dès qu'un facteur l'est, `ProtectedRoute` réclame
 * le code à chaque session. C'est le compromis retenu — il protège le compte
 * sans risquer d'enfermer dehors l'unique administrateur si l'inscription
 * échoue à mi-parcours.
 */
export function MfaEnrollment() {
  const { facteurs, chargement, rafraichir } = useFacteursMfa();
  const { toast } = useToast();
  const [inscription, setInscription] = useState<InscriptionEnCours | null>(null);
  const [code, setCode] = useState('');
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const actif = facteurVerifie(facteurs);

  if (!mfaDisponible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vérification en deux étapes</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Indisponible : le site tourne sur le backend local, qui ne gère pas
              l'authentification à deux facteurs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const demarrer = async () => {
    setOccupe(true);
    setErreur(null);
    try {
      // Une inscription abandonnée laisse un facteur `unverified` qui bloque la
      // suivante : on fait le ménage avant de repartir.
      await nettoyerFacteursNonVerifies(facteurs);

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: NOM_FACTEUR,
      });
      if (error) throw error;

      setInscription({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch (e) {
      setErreur(
        e instanceof Error
          ? e.message
          : "L'inscription n'a pas pu démarrer. Vérifiez que le facteur TOTP est activé côté projet Supabase.",
      );
    } finally {
      setOccupe(false);
    }
  };

  const confirmer = async () => {
    if (!inscription || code.length !== LONGUEUR_CODE) return;

    setOccupe(true);
    setErreur(null);
    try {
      const { data: defi, error: erreurDefi } = await supabase.auth.mfa.challenge({
        factorId: inscription.factorId,
      });
      if (erreurDefi) throw erreurDefi;

      const { error: erreurVerif } = await supabase.auth.mfa.verify({
        factorId: inscription.factorId,
        challengeId: defi.id,
        code,
      });
      if (erreurVerif) throw erreurVerif;

      setInscription(null);
      setCode('');
      await rafraichir();
      toast({
        title: 'Vérification en deux étapes activée',
        description: 'Un code vous sera demandé à chaque connexion.',
      });
    } catch {
      setErreur('Code incorrect ou expiré. Saisissez le code affiché à cet instant.');
      setCode('');
    } finally {
      setOccupe(false);
    }
  };

  const annuler = async () => {
    if (!inscription) return;
    setOccupe(true);
    // Le facteur n'a jamais été vérifié : le laisser en place bloquerait la
    // prochaine tentative.
    await supabase.auth.mfa.unenroll({ factorId: inscription.factorId }).catch(() => undefined);
    setInscription(null);
    setCode('');
    setErreur(null);
    await rafraichir();
    setOccupe(false);
  };

  const desactiver = async () => {
    if (!actif) return;
    setOccupe(true);
    setErreur(null);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: actif.id });
      if (error) throw error;
      await rafraichir();
      toast({
        title: 'Vérification en deux étapes désactivée',
        description: 'La connexion ne demande plus de code.',
      });
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'La désactivation a échoué.');
    } finally {
      setOccupe(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#2E1A47]" />
            <CardTitle className="text-base">Vérification en deux étapes</CardTitle>
          </div>
          {!chargement &&
            (actif ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600">Activée</Badge>
            ) : (
              <Badge variant="secondary">Désactivée</Badge>
            ))}
        </div>
        <CardDescription>
          Un code à usage unique, en plus du mot de passe, à chaque connexion. Ce compte
          ouvre l'accès à l'ensemble des données clients.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Lecture de l'état…
          </div>
        ) : inscription ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scannez ce QR code avec votre application d'authentification (Google
              Authenticator, Authy, 1Password…), puis saisissez le code affiché.
            </p>

            <div className="flex justify-center">
              <img
                src={inscription.qrCode}
                alt="QR code d'inscription du second facteur"
                className="h-48 w-48 rounded-md border bg-white p-2"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Ou saisissez cette clé manuellement
              </Label>
              <code className="block break-all rounded-md bg-muted p-2 text-xs">
                {inscription.secret}
              </code>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code-inscription">Code de vérification</Label>
              <Input
                id="code-inscription"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, LONGUEUR_CODE))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="text-center text-xl tracking-[0.4em] h-12"
                disabled={occupe}
              />
            </div>

            {erreur && (
              <Alert variant="destructive">
                <AlertDescription>{erreur}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={confirmer}
                disabled={code.length !== LONGUEUR_CODE || occupe}
                className="flex-1"
              >
                {occupe && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer l'activation
              </Button>
              <Button variant="outline" onClick={annuler} disabled={occupe}>
                Annuler
              </Button>
            </div>
          </div>
        ) : actif ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3">
              <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">{actif.friendly_name || NOM_FACTEUR}</span>
            </div>

            {erreur && (
              <Alert variant="destructive">
                <AlertDescription>{erreur}</AlertDescription>
              </Alert>
            )}

            <Button variant="outline" onClick={desactiver} disabled={occupe}>
              {occupe ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldOff className="mr-2 h-4 w-4" />
              )}
              Désactiver
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {erreur && (
              <Alert variant="destructive">
                <AlertDescription>{erreur}</AlertDescription>
              </Alert>
            )}
            <Button onClick={demarrer} disabled={occupe}>
              {occupe && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MfaEnrollment;
