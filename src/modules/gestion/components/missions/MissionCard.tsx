import { Button } from "@gestion/components/ui/button";
import { Check, Clock, PlayCircle, Trash, Calendar } from "lucide-react";
import { Badge } from "@gestion/components/ui/badge";
import { updateTaskStatus, deleteTask } from "@gestion/services/taskService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@gestion/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@gestion/components/ui/dropdown-menu";
import { OrdreMissionDialog } from "./OrdreMissionDialog";
import { RapportMissionUpload } from "./RapportMissionUpload";
import type { MissionInfo } from "@gestion/services/missionDocumentService";
import {
  LIBELLES_STATUT_TACHE,
  type StatutAffiche,
  type StatutTache,
} from "@gestion/lib/spec/statutTache";

interface MissionCardProps {
  mission: {
    id: string;
    title: string;
    client: string;
    assignedTo: string;
    /** Statut affiché : retard et planification compris. */
    status: StatutAffiche;
    /** Statut réellement enregistré — le seul que l'on puisse réécrire. */
    statutEnregistre: StatutTache;
    startDate: string;
    endDate: string;
    rawStartDate: string | null;
    rawEndDate: string | null;
    clientId: string;
    collaborateurId: string;
  };
}

const MissionCard = ({ mission }: MissionCardProps) => {
  const queryClient = useQueryClient();

  const missionInfo: MissionInfo = {
    id: mission.id,
    title: mission.title,
    start_date: mission.rawStartDate,
    end_date: mission.rawEndDate,
    collaborateur_id: mission.collaborateurId,
    client_id: mission.clientId,
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatutTache }) =>
      updateTaskStatus(id, status),
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["collaborateurs"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du statut : " + error.message);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.success("Tâche supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["collaborateurs"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression : " + error.message);
    },
  });

  const getStatusBadge = (statut: StatutAffiche) => {
    switch (statut) {
      case "en_cours":
        return <Badge variant="secondary">{LIBELLES_STATUT_TACHE.en_cours}</Badge>;
      case "en_attente":
        return <Badge variant="outline">{LIBELLES_STATUT_TACHE.en_attente}</Badge>;
      case "planifie":
        return (
          <Badge variant="default" className="bg-blue-500">
            {LIBELLES_STATUT_TACHE.planifie}
          </Badge>
        );
      case "termine":
        return <Badge variant="success">{LIBELLES_STATUT_TACHE.termine}</Badge>;
      case "en_retard":
        return <Badge variant="destructive">{LIBELLES_STATUT_TACHE.en_retard}</Badge>;
      default:
        return null;
    }
  };

  const handleStatusChange = (newStatus: StatutTache) => {
    updateStatusMutation.mutate({ id: mission.id, status: newStatus });
  };

  const handleDelete = () => {
    deleteTaskMutation.mutate(mission.id);
  };

  return (
    <div className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {/*
        Mobile : le titre occupe toute la largeur et les actions passent sur
        leur propre rangée en dessous. En colonne latérale, quatre boutons à
        44 px de haut ne laissaient que ~130 px au titre en 375 px.
        À partir de `sm`, la disposition en deux colonnes reprend.
      */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base sm:text-lg truncate">{mission.title}</h3>
            <div className="shrink-0 sm:hidden">{getStatusBadge(mission.status)}</div>
          </div>
          <p className="text-gray-600 text-sm truncate">{mission.client}</p>
          <p className="text-xs sm:text-sm text-gray-500 truncate">Assigné à : {mission.assignedTo}</p>
          <div className="flex gap-2 mt-1.5">
            <span className="text-xs sm:text-sm text-gray-500">
              Du {mission.startDate} au {mission.endDate}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end sm:shrink-0">
          <div className="hidden sm:block">{getStatusBadge(mission.status)}</div>

          {/* Actions principales */}
          <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:justify-end">
            {/* Ordre de mission */}
            <OrdreMissionDialog mission={missionInfo} missionTitle={mission.title} />

            {/* Rapport de mission */}
            <RapportMissionUpload mission={missionInfo} missionTitle={mission.title} />

            {/* Changer le statut */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="cible-tactile w-full justify-center px-3 text-xs sm:w-auto"
                >
                  Statut
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("en_attente")}
                  className="flex items-center gap-2"
                  disabled={mission.statutEnregistre === "en_attente"}
                >
                  <Calendar className="h-4 w-4" /> En attente
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("en_cours")}
                  className="flex items-center gap-2"
                  disabled={mission.statutEnregistre === "en_cours"}
                >
                  <PlayCircle className="h-4 w-4" /> En cours
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("termine")}
                  className="flex items-center gap-2"
                  disabled={mission.statutEnregistre === "termine"}
                >
                  <Check className="h-4 w-4" /> Terminée
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Supprimer */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Supprimer la mission"
                  className="cible-tactile w-full justify-center px-3 text-red-500 hover:bg-red-50 hover:text-red-600 sm:w-auto"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la mission ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La mission et ses documents associés seront supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionCard;
