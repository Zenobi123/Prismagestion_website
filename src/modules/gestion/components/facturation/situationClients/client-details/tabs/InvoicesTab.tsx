
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Facture } from "@gestion/types/facture";
import { useClientDetails } from "../client-details-context";
import InvoicesTable from "../InvoicesTable";
import InvoicePreviewDialog from "../../dialogs/InvoicePreviewDialog";
import CreateFactureDialog from "@gestion/components/facturation/factures/CreateFactureDialog";

const InvoicesTab = () => {
  const { clientDetails, onOpenApplyCreditDialog, onOpenReminderDialog } = useClientDetails();
  const [selectedInvoice, setSelectedInvoice] = useState<Facture | null>(null);
  const [isInvoicePreviewDialogOpen, setIsInvoicePreviewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Le formulaire de facture a besoin de la liste des clients pour son
  // sélecteur. On réutilise la clé de l'onglet Factures : le cache est
  // partagé, aucune requête supplémentaire n'est émise.
  const { data: clientsFacturables = [] } = useQuery({
    queryKey: ["clients-for-factures"],
    queryFn: async () => {
      const { getClients } = await import("@gestion/services/clientService");
      return getClients();
    },
  });

  if (!clientDetails) return null;

  // Find any available credits (paiements that are est_credit and have no facture_id)
  const availableCredits = clientDetails.paiements.filter(p => p.est_credit && !p.facture_id) || [];
  const clientName = clientDetails.nom || "Client";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {/* Le bouton portait la bonne intention mais aucun gestionnaire.
            La création de facture passe par le dialogue déjà utilisé par
            l'onglet Factures ; le client courant lui est pré-passé pour
            éviter de le resaisir. */}
        <CreateFactureDialog
          clients={clientsFacturables}
          onFactureCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["factures"] });
            queryClient.invalidateQueries({
              queryKey: ["situation-client-factures", clientDetails.id],
            });
          }}
        />
      </div>
      
      <InvoicesTable 
        invoices={clientDetails.factures}
        availableCredits={availableCredits}
        onOpenApplyCreditDialog={onOpenApplyCreditDialog}
        onOpenReminderDialog={onOpenReminderDialog}
        clientName={clientName}
      />

      {selectedInvoice && (
        <InvoicePreviewDialog
          open={isInvoicePreviewDialogOpen}
          onOpenChange={setIsInvoicePreviewDialogOpen}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
};

export default InvoicesTab;
