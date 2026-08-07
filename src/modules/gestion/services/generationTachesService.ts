import { supabase } from "@gestion/integrations/supabase/client";
import type { Client } from "@gestion/types/client";
import {
  planifierTachesFiscales,
  ecarterDejaGenerees,
  ANTICIPATION_JOURS,
  type TachePlanifiee,
} from "@gestion/lib/spec/generationTaches";

export interface OptionsChargement {
  annee: number;
  anticipationJours?: number;
  aujourdhui?: Date;
}

/**
 * Établit ce qu'il reste à générer : toutes les échéances de l'année pour les
 * clients actifs, moins celles déjà transformées en tâches.
 *
 * La logique de planification est pure et vit dans `lib/spec/generationTaches`.
 * Ce service ne fait que l'alimenter et confronter son résultat à la base.
 */
export async function chargerPlanification(
  options: OptionsChargement,
): Promise<TachePlanifiee[]> {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("statut", "actif");

  if (error) throw error;

  const planifiees = planifierTachesFiscales(
    (clients ?? []) as unknown as Client[],
    {
      annee: options.annee,
      aujourdhui: options.aujourdhui,
      anticipationJours: options.anticipationJours ?? ANTICIPATION_JOURS,
    },
  );

  const { data: existantes, error: erreurTaches } = await supabase
    .from("tasks")
    .select("client_id, reference_obligation")
    .not("reference_obligation", "is", null);

  if (erreurTaches) throw erreurTaches;

  return ecarterDejaGenerees(planifiees, existantes ?? []);
}

/**
 * Crée les tâches retenues.
 *
 * `collaborateur_id` est NOT NULL en base : une tâche appartient toujours à
 * quelqu'un. L'index unique `(client_id, reference_obligation)` protège des
 * doublons même si deux générations se croisent — d'où `ignoreDuplicates`,
 * qui laisse passer une échéance déjà créée au lieu de faire échouer le lot.
 */
export async function creerTaches(
  taches: TachePlanifiee[],
  collaborateurId: string,
  aujourdhui: Date = new Date(),
): Promise<number> {
  if (taches.length === 0) return 0;

  const jour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());

  const lignes = taches.map((t) => ({
    title: `${t.clientNom} — ${t.titre}`,
    client_id: t.clientId,
    collaborateur_id: collaborateurId,
    start_date: t.dateDebut,
    end_date: t.echeance,
    reference_obligation: t.reference,
    // La contrainte `tasks_status_check` n'admet que en_attente / en_cours /
    // termine : une échéance dont la fenêtre est ouverte démarre en cours.
    status: new Date(`${t.dateDebut}T12:00:00`) <= jour ? "en_cours" : "en_attente",
  }));

  const { data, error } = await supabase
    .from("tasks")
    .upsert(lignes, {
      onConflict: "client_id,reference_obligation",
      ignoreDuplicates: true,
    })
    .select("id");

  if (error) throw error;
  return data?.length ?? 0;
}
