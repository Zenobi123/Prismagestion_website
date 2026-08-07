
import { supabase } from "@gestion/integrations/supabase/client";
import {
  statutAffiche,
  statutInitial,
  type StatutAffiche,
  type StatutTache,
} from "@gestion/lib/spec/statutTache";

export type { StatutAffiche, StatutTache };

/**
 * Une tâche telle qu'elle existe en base, relations chargées comprises.
 *
 * `status` ne connaît que les trois valeurs admises par
 * `tasks_status_check`. « En retard » n'en fait pas partie : c'est un statut
 * dérivé des dates, porté par `statut_affiche` sur `TacheAffichee`.
 */
export interface Task {
  id: string;
  title: string;
  client_id?: string; // Made optional
  collaborateur_id: string;
  status: StatutTache;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  reference_obligation?: string | null;
  // Relations
  collaborateurs?: {
    id: string;
    nom: string;
    prenom: string;
  };
  clients?: {
    id: string;
    nom: string;
    raisonsociale: string;
    type: string;
  };
}

/**
 * Une tâche enrichie du statut à afficher, calculé à la lecture.
 * `statut_affiche` n'est pas une colonne : rien ne l'écrit jamais.
 */
export interface TacheAffichee extends Task {
  statut_affiche: StatutAffiche;
}

/**
 * Lecture seule. Cette fonction a longtemps réécrit les statuts et
 * resynchronisé `collaborateurs.tachesencours` à chaque appel — avec un
 * `refetchInterval` de 60 s sur trois écrans, la console réécrivait la base
 * en boucle, et l'un de ces UPDATE violait `tasks_status_check` sans que
 * personne ne le voie. Le statut « en retard » se dérive désormais des dates,
 * et la charge des collaborateurs se lit dans la vue `collaborateurs_charge`.
 */
export const getTasks = async (): Promise<TacheAffichee[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      clients!tasks_client_id_fkey (
        id,
        nom,
        raisonsociale,
        type
      ),
      collaborateurs!tasks_collaborateur_id_fkey (
        id,
        nom,
        prenom
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const aujourdhui = new Date();
  return ((data ?? []) as unknown as Task[]).map((task) => ({
    ...task,
    statut_affiche: statutAffiche(task, aujourdhui),
  }));
};

/**
 * Statut d'une tâche à sa création.
 * @deprecated Utiliser `statutInitial` de `@gestion/lib/spec/statutTache`.
 */
export const determineInitialStatus = statutInitial;

export const createTask = async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {

  // Determine initial status based on start date
  const initialStatus = statutInitial(task.start_date);

  // `clients` et `collaborateurs` sont les relations chargées par les
  // jointures de lecture, pas des colonnes de `tasks`. Si l'appelant
  // recycle une tâche lue pour en créer une nouvelle, elles arrivent
  // jusqu'ici et PostgREST rejette alors l'insertion entière.
  const { clients: _clients, collaborateurs: _collaborateurs, ...colonnes } = task;
  const taskWithStatus = {
    ...colonnes,
    status: initialStatus
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert([taskWithStatus])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateTaskStatus = async (taskId: string, status: StatutTache) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    throw error;
  }

  return true;
};
