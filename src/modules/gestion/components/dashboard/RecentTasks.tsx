import { useQuery } from "@tanstack/react-query";
import { getTasks, type TacheAffichee } from "@gestion/services/taskService";
import { Clock, Flame, User } from "lucide-react";
import { Badge } from "@gestion/components/ui/badge";
import { useExercice } from "@gestion/contexts/ExerciceContext";
import { useIsMobile } from "@gestion/hooks/use-mobile";
import { LIBELLES_STATUT_TACHE, type StatutAffiche } from "@gestion/lib/spec/statutTache";

/**
 * Accent de la ligne ou de la carte, selon le statut affiché. Une seule
 * définition pour les deux rendus : le tableau et les cartes ne peuvent pas
 * diverger.
 */
const ACCENT_STATUT: Partial<Record<StatutAffiche, string>> = {
  en_retard: "bg-[#fff1f2] border-[#ea384c]",
  planifie: "bg-purple-50 border-purple-500",
};

const RecentTasks = () => {
  const { isVisibleByDate } = useExercice();
  const isMobile = useIsMobile();
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000
  });

  // Exercice comptable : masquer les missions des années clôturées (sauf consultation),
  // puis retirer les tâches terminées et limiter à 10 tâches actives.
  const activeTasks = tasks
    .filter((task) => isVisibleByDate(task.start_date || task.end_date || task.created_at))
    .filter((task) => task.statut_affiche !== "termine")
    .slice(0, 10);

  // Le retard et la planification ne sont plus recalculés ici : `getTasks()`
  // livre `statut_affiche`, seule source de la règle (`lib/spec/statutTache`).
  const getStatusBadge = (statut: StatutAffiche) => {
    switch (statut) {
      case "en_retard":
        return (
          <Badge className="flex items-center gap-1 animate-pulse-slow bg-[#ea384c] hover:bg-[#d32f40] text-white">
            <Flame size={14} className="mr-1" />
            {LIBELLES_STATUT_TACHE.en_retard}
          </Badge>
        );
      case "planifie":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            {LIBELLES_STATUT_TACHE.planifie}
          </Badge>
        );
      case "en_cours":
        return <Badge variant="success">{LIBELLES_STATUT_TACHE.en_cours}</Badge>;
      case "termine":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            {LIBELLES_STATUT_TACHE.termine}
          </Badge>
        );
      default:
        return <Badge variant="outline">{LIBELLES_STATUT_TACHE.en_attente}</Badge>;
    }
  };

  const nomClient = (task: TacheAffichee) =>
    task.clients && task.clients.type === "physique"
      ? task.clients.nom
      : task.clients?.raisonsociale || "Client inconnu";

  const nomCollaborateur = (task: TacheAffichee) =>
    task.collaborateurs
      ? `${task.collaborateurs.prenom} ${task.collaborateurs.nom}`
      : "Non assigné";

  const echeance = (task: TacheAffichee) =>
    task.end_date ? new Date(task.end_date).toLocaleDateString() : "Non définie";

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-neutral-100 rounded-md mb-2"></div>
        <div className="h-12 bg-neutral-100 rounded-md mb-2"></div>
        <div className="h-12 bg-neutral-100 rounded-md"></div>
      </div>
    );
  }

  if (activeTasks.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 py-6 text-center text-gray-500">
        Aucune tâche active n'a été trouvée.
      </div>
    );
  }

  // Mobile : cartes. Le tableau à cinq colonnes laissait 73 px au titre de la
  // tâche en 375 px, soit une poignée de caractères par ligne — illisible sur
  // l'écran par lequel arrive la quasi-totalité du trafic.
  if (isMobile) {
    return (
      <ul className="space-y-2">
        {activeTasks.map((task) => (
          <li
            key={task.id}
            className={`rounded-lg border border-l-4 p-3 transition-colors ${
              ACCENT_STATUT[task.statut_affiche] ?? "border-neutral-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 font-medium leading-snug">{task.title}</p>
              <div className="shrink-0">{getStatusBadge(task.statut_affiche)}</div>
            </div>

            <p className="mt-1 truncate text-sm text-neutral-600">{nomClient(task)}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <User size={13} />
                {nomCollaborateur(task)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock
                  size={13}
                  className={task.statut_affiche === "en_retard" ? "text-[#ea384c]" : ""}
                />
                {echeance(task)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Tâche</th>
            <th>Client</th>
            <th>Assigné à</th>
            <th>Statut</th>
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          {activeTasks.map((task) => {
            const isOverdue = task.statut_affiche === "en_retard";
            const accent = ACCENT_STATUT[task.statut_affiche];

            return (
              <tr
                key={task.id}
                className={
                  accent
                    ? `${accent} border-l-4 transition-colors ${
                        isOverdue ? "text-[#ea384c] hover:bg-[#ffe6e8]" : "hover:bg-purple-100"
                      }`
                    : "hover:bg-neutral-50 transition-colors"
                }
              >
                <td className="font-medium">{task.title}</td>
                <td>{nomClient(task)}</td>
                <td>{nomCollaborateur(task)}</td>
                <td>{getStatusBadge(task.statut_affiche)}</td>
                <td className="flex items-center gap-1">
                  {task.end_date ? (
                    <>
                      <Clock
                        size={14}
                        className={isOverdue ? "text-[#ea384c] animate-pulse-slow" : ""}
                      />
                      {echeance(task)}
                    </>
                  ) : (
                    "Non définie"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTasks;
