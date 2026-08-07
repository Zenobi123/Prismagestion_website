
import { useMemo } from "react";
import type { StatutAffiche } from "@gestion/lib/spec/statutTache";

interface TacheComptee {
  statut_affiche: StatutAffiche;
  end_date?: string;
}

/**
 * Compteurs du tableau de bord.
 *
 * Le retard n'est plus recalculé ici : `getTasks()` livre déjà
 * `statut_affiche`, dérivé des dates par `lib/spec/statutTache.ts`. Ce hook
 * ne fait plus que compter, ce qui garantit que le tableau de bord, la liste
 * des tâches et la vue `collaborateurs_charge` disent la même chose.
 */
export const useTaskStats = (tasks: TacheComptee[], isLoading: boolean) => {
  return useMemo(() => {
    if (isLoading || !tasks) {
      return {
        activeTasks: 0,
        overdueTasks: 0,
        completedMissions: 0
      };
    }

    // Tâches en cours : commencées, pas terminées, pas encore en retard.
    const activeTasks = tasks.filter((task) => task.statut_affiche === "en_cours").length;

    const overdueTasks = tasks.filter((task) => task.statut_affiche === "en_retard").length;

    // Missions terminées ce mois-ci.
    const currentMonth = new Date().getMonth();
    const completedMissions = tasks.filter((task) => {
      if (task.statut_affiche !== "termine" || !task.end_date) return false;
      const endDate = new Date(task.end_date);
      return endDate.getMonth() === currentMonth;
    }).length;

    return {
      activeTasks,
      overdueTasks,
      completedMissions
    };
  }, [tasks, isLoading]);
};
