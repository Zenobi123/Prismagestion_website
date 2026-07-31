
import { useState } from "react";
import { useToast } from "@gestion/components/ui/use-toast";
import { supabase } from "@gestion/integrations/supabase/client";
import { Paiement } from "@gestion/types/paiement";
import { recalculerStatutPaiementFacture } from "@gestion/services/factureServices/facturePaiementSyncService";

/**
 * Ne conserve que les champs qui correspondent à une colonne de `paiements`.
 *
 * Le type `Paiement` est plus riche que la table : il porte le libellé de
 * facture, l'objet client résolu, le type de paiement et le détail des
 * prestations réglées, utiles à l'affichage mais absents du schéma. Envoyés
 * tels quels, ils faisaient rejeter la requête entière par PostgREST — la
 * mise à jour d'un paiement échouait donc systématiquement.
 */
const versColonnesPaiement = (updates: Partial<Paiement>) => {
  const {
    facture,
    client: _client,
    type_paiement: _typePaiement,
    prestations_payees: _prestationsPayees,
    ...colonnes
  } = updates;

  return {
    ...colonnes,
    // Côté base, la facture rattachée est référencée par `facture_id`.
    ...(facture !== undefined ? { facture_id: facture } : {}),
  };
};

export const usePaiementUpdate = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updatePaiement = async (id: string, updates: Partial<Paiement>) => {
    setIsLoading(true);
    try {
      const { data: avant } = await supabase
        .from("paiements")
        .select("facture_id")
        .eq("id", id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("paiements")
        .update(versColonnesPaiement(updates))
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Recalculer l'état de la facture d'origine et, si le paiement a été
      // rattaché à une autre facture, celui de la nouvelle.
      await recalculerStatutPaiementFacture(avant?.facture_id);
      if (data?.facture_id && data.facture_id !== avant?.facture_id) {
        await recalculerStatutPaiementFacture(data.facture_id);
      }

      toast({
        title: "Paiement mis à jour",
        description: `Le paiement a été mis à jour avec succès.`,
      });

      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le paiement. Veuillez réessayer.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePaiement,
    isLoading
  };
};
