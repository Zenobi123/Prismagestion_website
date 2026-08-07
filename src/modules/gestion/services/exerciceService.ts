import { supabase } from "@gestion/integrations/supabase/client";
import type { ClotureExercice } from "@gestion/lib/spec/clotureComptable";

/**
 * Registre des exercices clôturés.
 *
 * Une année absente de la table `exercices` est ouverte — même sémantique que
 * l'ancien stockage local, où seules les clôtures étaient enregistrées. La
 * différence est qu'elle vaut désormais pour tous les appareils, survit au
 * vidage du cache, et verrouille réellement les écritures (trigger
 * `verrouiller_exercice_clos`).
 */
export async function getExercicesClos(): Promise<ClotureExercice[]> {
  const { data, error } = await supabase
    .from("exercices")
    .select("annee, cloture_le")
    .eq("statut", "clos")
    .order("annee", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((e) => ({
    year: e.annee,
    closedAt: e.cloture_le,
  }));
}

export async function cloturerExercice(annee: number): Promise<void> {
  const { error } = await supabase
    .from("exercices")
    .upsert(
      { annee, statut: "clos", cloture_le: new Date().toISOString() },
      { onConflict: "annee" },
    );

  if (error) throw error;
}

/**
 * Rouvre un exercice. La ligne est supprimée plutôt que passée à « ouvert » :
 * l'absence est l'état ouvert, et le journal d'audit conserve de toute façon
 * la trace de la clôture comme de sa levée.
 */
export async function rouvrirExercice(annee: number): Promise<void> {
  const { error } = await supabase.from("exercices").delete().eq("annee", annee);
  if (error) throw error;
}
