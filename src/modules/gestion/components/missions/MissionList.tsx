
import MissionCard from "@gestion/components/missions/MissionCard";
import type { StatutAffiche, StatutTache } from "@gestion/lib/spec/statutTache";

interface Mission {
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
  createdAt: string;
}

interface MissionListProps {
  missions: Mission[];
  isLoading: boolean;
}

const MissionList = ({ missions, isLoading }: MissionListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {missions.length > 0 ? (
        missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucune mission n'a été trouvée. Utilisez le bouton "Nouvelle tâche" pour en créer une.
        </div>
      )}
    </div>
  );
};

export default MissionList;
