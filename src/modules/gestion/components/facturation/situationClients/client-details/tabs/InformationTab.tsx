
import { useNavigate } from "react-router-dom";
import { Button } from "@gestion/components/ui/button";
import { Edit } from "lucide-react";
import { useClientDetails } from "../client-details-context";
import { gestionPath } from "@gestion/routes";
import ClientInfoSection from "./information/ClientInfoSection";

const InformationTab = () => {
  const { clientDetails } = useClientDetails();
  const navigate = useNavigate();

  // Use the client data from clientDetails if available
  const client = clientDetails?.client || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">
            Informations générales
          </h3>
          
          <ClientInfoSection client={client} />
        </div>
      </div>
      
      <div>
        {/* Cet onglet est en lecture seule : la fiche complète, avec ses
            règles de validation fiscale, vit sur la page Clients. Le bouton
            y conduit — le dialogue se referme de lui-même au changement de
            route. Il n'avait auparavant aucun gestionnaire. */}
        <Button
          onClick={() => navigate(gestionPath("clients"))}
          className="bg-[#3C6255] hover:bg-[#2B4B3E] text-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Modifier les informations
        </Button>
      </div>
    </div>
  );
};

export default InformationTab;
