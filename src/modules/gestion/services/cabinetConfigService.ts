// Acces Supabase a l'identite du cabinet (table cabinet_config, ligne unique).
//
// Le type est importe avec `import type` : l'import est efface a la
// compilation, ce qui evite le cycle avec lib/spec/cabinetConfig.ts, lequel
// importe ce service.

import { supabase } from '@gestion/integrations/supabase/client';
import type { CabinetConfig } from '@gestion/lib/spec/cabinetConfig';

/** Colonnes de la table, en snake_case. */
type LigneCabinetConfig = {
  nom_cabinet: string;
  slogan: string;
  siege: string;
  telephone: string;
  niu: string;
  signataire_nom: string;
  signataire_titre: string;
  signature: string | null;
  cachet: string | null;
  signature_promo: string;
  mode_paiement: string;
  numeros_paiement: string;
  echeance_facture: string;
};

const COLONNES =
  'nom_cabinet, slogan, siege, telephone, niu, signataire_nom, signataire_titre, ' +
  'signature, cachet, signature_promo, mode_paiement, numeros_paiement, echeance_facture';

function versConfig(ligne: LigneCabinetConfig): CabinetConfig {
  return {
    nomCabinet: ligne.nom_cabinet,
    slogan: ligne.slogan,
    siege: ligne.siege,
    telephone: ligne.telephone,
    niu: ligne.niu,
    signataireNom: ligne.signataire_nom,
    signataireTitre: ligne.signataire_titre,
    signature: ligne.signature ?? undefined,
    cachet: ligne.cachet ?? undefined,
    signaturePromo: ligne.signature_promo,
    modePaiement: ligne.mode_paiement,
    numerosPaiement: ligne.numeros_paiement,
    echeanceFacture: ligne.echeance_facture,
  };
}

function versLigne(cfg: CabinetConfig): LigneCabinetConfig {
  return {
    nom_cabinet: cfg.nomCabinet,
    slogan: cfg.slogan,
    siege: cfg.siege,
    telephone: cfg.telephone,
    niu: cfg.niu,
    signataire_nom: cfg.signataireNom,
    signataire_titre: cfg.signataireTitre,
    signature: cfg.signature ?? null,
    cachet: cfg.cachet ?? null,
    signature_promo: cfg.signaturePromo,
    mode_paiement: cfg.modePaiement,
    numeros_paiement: cfg.numerosPaiement,
    echeance_facture: cfg.echeanceFacture,
  };
}

/**
 * Lit la configuration en base. Renvoie `null` si elle est inaccessible —
 * hors ligne, session expiree, backend local de secours. L'appelant retombe
 * alors sur son cache, ce qui vaut mieux qu'un document sans en-tete.
 */
export async function lireCabinetConfig(): Promise<CabinetConfig | null> {
  const { data, error } = await supabase
    .from('cabinet_config')
    .select(COLONNES)
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn('cabinet_config illisible :', error.message);
    return null;
  }
  return versConfig(data as unknown as LigneCabinetConfig);
}

/**
 * Enregistre la configuration. La ligne 1 est creee par la migration : on la
 * met a jour plutot que de l'inserer, ce qui evite toute course entre deux
 * onglets ouverts sur l'ecran de parametres.
 */
export async function ecrireCabinetConfig(cfg: CabinetConfig): Promise<void> {
  const { error } = await supabase
    .from('cabinet_config')
    .update(versLigne(cfg))
    .eq('id', 1);

  if (error) throw new Error(error.message);
}
