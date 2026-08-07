import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@gestion/services/taskService";
import { AlertTriangle, Clock, Flame } from "lucide-react";
import { Badge } from "@gestion/components/ui/badge";
import { useExercice } from "@gestion/contexts/ExerciceContext";
import { LIBELLES_STATUT_TACHE, type StatutAffiche } from "@gestion/lib/spec/statutTache";

const RecentTasks = () => {
  const { isVisibleByDate } = useExercice();
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

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-neutral-100 rounded-md mb-2"></div>
        <div className="h-12 bg-neutral-100 rounded-md mb-2"></div>
        <div className="h-12 bg-neutral-100 rounded-md"></div>
      </div>
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
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => {
              const isOverdue = task.statut_affiche === "en_retard";
              const isPlanned = task.statut_affiche === "planifie";

              return (
                <tr 
                  key={task.id} 
                  className={isOverdue 
                    ? "bg-[#fff1f2] border-l-4 border-[#ea384c] text-[#ea384c] hover:bg-[#ffe6e8] transition-colors" 
                    : isPlanned
                      ? "bg-purple-50 border-l-4 border-purple-500 hover:bg-purple-100 transition-colors"
                      : "hover:bg-neutral-50 transition-colors"
                  }
                >
                  <td className="font-medium">{task.title}</td>
                  <td>
                    {task.clients && task.clients.type === "physique"
                      ? task.clients.nom
                      : task.clients?.raisonsociale || "Client inconnu"}
                  </td>
                  <td>
                    {task.collaborateurs ? `${task.collaborateurs.prenom} ${task.collaborateurs.nom}` : "Non assigné"}
                  </td>
                  <td>{getStatusBadge(task.statut_affiche)}</td>
                  <td className="flex items-center gap-1">
                    {task.end_date ? (
                      <>
                        <Clock 
                          size={14} 
                          className={isOverdue ? "text-[#ea384c] animate-pulse-slow" : ""} 
                        />
                        {new Date(task.end_date).toLocaleDateString()}
                      </>
                    ) : (
                      "Non définie"
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                Aucune tâche active n'a été trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTasks;
