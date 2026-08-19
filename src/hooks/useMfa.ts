import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

/**
 * Authentification à deux facteurs (TOTP), portée par Supabase Auth.
 *
 * Le backend de secours en `localStorage` n'implémente pas `auth.mfa` — voir
 * `src/lib/localBackend/auth.ts`. Sans ce garde, tout écran MFA planterait
 * lorsque le site tourne sans variables d'environnement.
 */
export const mfaDisponible = isSupabaseConfigured;

export interface FacteurMfa {
  id: string;
  friendly_name?: string;
  status: 'verified' | 'unverified';
}

type Niveau = 'aal1' | 'aal2' | null;

export interface EtatAssurance {
  /** Ce que vaut la session aujourd'hui : `aal1` mot de passe seul, `aal2` second facteur présenté. */
  courant: Niveau;
  /** Ce que Supabase attend compte tenu des facteurs inscrits sur le compte. */
  requis: Niveau;
  chargement: boolean;
}

/**
 * Niveau d'assurance de la session courante.
 *
 * `requis === 'aal2' && courant === 'aal1'` est exactement le cas « ce compte a
 * inscrit un second facteur mais ne l'a pas encore présenté » : c'est là, et
 * seulement là, qu'il faut réclamer le code.
 *
 * En cas d'échec de l'appel, l'état reste vide plutôt que de basculer vers une
 * exigence inventée : bloquer sur une erreur réseau enfermerait dehors un
 * administrateur parfaitement légitime.
 */
export function useNiveauAssurance() {
  const [etat, setEtat] = useState<EtatAssurance>({
    courant: null,
    requis: null,
    chargement: mfaDisponible,
  });

  const rafraichir = useCallback(async () => {
    if (!mfaDisponible) {
      setEtat({ courant: null, requis: null, chargement: false });
      return;
    }

    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      setEtat({
        courant: (data?.currentLevel ?? null) as Niveau,
        requis: (data?.nextLevel ?? null) as Niveau,
        chargement: false,
      });
    } catch {
      setEtat({ courant: null, requis: null, chargement: false });
    }
  }, []);

  useEffect(() => {
    rafraichir();
  }, [rafraichir]);

  return { ...etat, rafraichir };
}

/** Vrai lorsque la session doit encore présenter son second facteur. */
export function secondFacteurAttendu(etat: EtatAssurance): boolean {
  return etat.requis === 'aal2' && etat.courant === 'aal1';
}

/**
 * Facteurs inscrits sur le compte courant.
 *
 * Supabase conserve les facteurs restés `unverified` — une inscription
 * abandonnée en cours de route. Ils ne protègent rien et empêchent d'en
 * réinscrire un : `nettoyerFacteursNonVerifies()` les retire.
 */
export function useFacteursMfa() {
  const [facteurs, setFacteurs] = useState<FacteurMfa[]>([]);
  const [chargement, setChargement] = useState(mfaDisponible);

  const rafraichir = useCallback(async () => {
    if (!mfaDisponible) {
      setFacteurs([]);
      setChargement(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFacteurs((data?.all ?? []) as FacteurMfa[]);
    } catch {
      setFacteurs([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    rafraichir();
  }, [rafraichir]);

  return { facteurs, chargement, rafraichir };
}

export function facteurVerifie(facteurs: FacteurMfa[]): FacteurMfa | undefined {
  return facteurs.find((f) => f.status === 'verified');
}

/** Retire les facteurs laissés en plan par une inscription interrompue. */
export async function nettoyerFacteursNonVerifies(facteurs: FacteurMfa[]): Promise<void> {
  if (!mfaDisponible) return;

  await Promise.all(
    facteurs
      .filter((f) => f.status === 'unverified')
      .map((f) => supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => undefined)),
  );
}
