import { supabase } from '@/integrations/supabase/client';

export interface SubscribeInput {
  email: string;
  /** Origine de la capture, ex. 'calculateur-igs', 'guide-creation', 'footer'. */
  source: string;
  /** Contexte optionnel (secteur, valeur calculée, service d'intérêt...). */
  context?: string;
  consent?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Inscrit un email (lead) dans `newsletter_subscribers`.
 *
 * Avec la RLS, un visiteur anonyme peut insérer mais pas relire : on ne fait
 * donc pas de `.select()`. Un doublon (même email + même source) est traité
 * comme un succès idempotent.
 */
export const subscribe = async (
  input: SubscribeInput,
): Promise<{ ok: boolean; error?: string }> => {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Adresse email invalide.' };
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({
    id: crypto.randomUUID(),
    email,
    source: input.source,
    context: input.context ?? '',
    consent: input.consent ?? true,
    read: false,
  });

  if (error) {
    // Doublon (index unique) → déjà inscrit : on considère l'opération réussie.
    const code = (error as { code?: string }).code;
    if (code === '23505') return { ok: true };
    console.error('Inscription newsletter échouée:', error);
    return { ok: false, error: "L'inscription n'a pas pu être enregistrée." };
  }

  return { ok: true };
};
