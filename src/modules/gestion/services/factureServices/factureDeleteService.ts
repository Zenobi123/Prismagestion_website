
import { supabase } from "@gestion/integrations/supabase/client";

/**
 * Supprime une facture et ses lignes de prestations.
 *
 * Une facture émise est une pièce : elle ne se supprime pas, elle s'annule
 * (`useFactureSendCancelActions.cancelFacture`, statut « annulée »). Seul un
 * brouillon jamais réglé peut disparaître.
 *
 * Deux garde-fous couvrent la même règle, volontairement :
 * - celui-ci produit un message compréhensible dans le toast de
 *   `useFactureDeleteActions`, qui relaie le `message` de l'erreur levée ;
 * - la base refuse de son côté (contrainte `paiements_facture_id_fkey` en
 *   RESTRICT, trigger `factures_interdire_suppression_piece`), ce que
 *   l'interface ne peut pas contourner.
 */
export const deleteFactureFromDatabase = async (factureId: string): Promise<boolean> => {

  const { data: factureData, error: fetchError } = await supabase
    .from("factures")
    .select("status")
    .eq("id", factureId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
  }

  // Une facture sortie du brouillon a été émise : elle s'annule, elle ne se
  // supprime pas — y compris lorsqu'elle est déjà annulée, qui reste un état
  // de pièce et non un état de travail.
  if (factureData.status !== "brouillon") {
    throw new Error(
      "Cette facture a été émise : elle ne peut plus être supprimée. " +
        "Utilisez « Annuler » pour la neutraliser en conservant sa trace.",
    );
  }

  // Un règlement encaissé ne disparaît pas avec le document qui l'a motivé.
  const { count: paiementsCount, error: paiementsCountError } = await supabase
    .from("paiements")
    .select("id", { count: "exact", head: true })
    .eq("facture_id", factureId);

  if (paiementsCountError) {
    throw new Error(`Failed to check invoice payments: ${paiementsCountError.message}`);
  }

  if ((paiementsCount ?? 0) > 0) {
    throw new Error(
      "Cette facture porte des paiements enregistrés : elle ne peut pas être supprimée. " +
        "Supprimez d'abord les paiements concernés, ou annulez la facture.",
    );
  }

  // First delete associated prestations
  const { error: prestationsError } = await supabase
    .from("facture_prestations")
    .delete()
    .eq("facture_id", factureId);

  if (prestationsError) {
    throw new Error(`Failed to delete invoice services: ${prestationsError.message}`);
  }

  // Then delete the facture itself
  const { error: factureError } = await supabase
    .from("factures")
    .delete()
    .eq("id", factureId);

  if (factureError) {
    throw new Error(`Failed to delete invoice: ${factureError.message}`);
  }

  // Référence : la suppression d'une facture issue d'un devis « libère » le
  // devis, qui redevient convertible (statut « accepté », lien effacé).
  await supabase
    .from("devis")
    .update({
      status: "accepte",
      facture_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("facture_id", factureId)
    .eq("status", "converti");

  return true;
};
