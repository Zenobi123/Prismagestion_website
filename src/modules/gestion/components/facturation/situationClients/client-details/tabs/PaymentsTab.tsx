
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@gestion/components/ui/button";
import { Plus } from "lucide-react";
import { useClientDetails } from "../client-details-context";
import { Paiement } from "@gestion/types/paiement";
import type { ClientPayment } from "@gestion/types/clientFinancial";
import PaymentsTable from "../PaymentsTable";
import PaymentReceiptDialog from "../../../paiements/dialog/PaymentReceiptDialog";
import PaiementDialog from "@gestion/components/facturation/paiements/PaiementDialog";
// usePaiementActions plutôt que usePaiements : ce dernier recharge la
// totalité des paiements du cabinet à son montage, alors qu'on n'a besoin
// ici que de la fonction d'ajout.
import { usePaiementActions } from "@gestion/hooks/facturation/paiementActions/usePaiementActions";

const PaymentsTab = () => {
  const { clientDetails } = useClientDetails();
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null);
  const [isPaymentReceiptDialogOpen, setIsPaymentReceiptDialogOpen] = useState(false);
  const [isAddPaiementDialogOpen, setIsAddPaiementDialogOpen] = useState(false);
  const { addPaiement } = usePaiementActions();
  const queryClient = useQueryClient();

  if (!clientDetails) return null;

  // Le bouton d'ajout n'avait aucun gestionnaire. On réutilise le dialogue
  // de l'onglet Paiements et son hook d'enregistrement, puis on rafraîchit
  // la situation du client pour que la ligne apparaisse sans rechargement.
  const handleAddPaiement = async (paiement: Omit<Paiement, "id">) => {
    const resultat = await addPaiement(paiement);
    queryClient.invalidateQueries({ queryKey: ["paiements"] });
    queryClient.invalidateQueries({ queryKey: ["factures"] });
    queryClient.invalidateQueries({
      queryKey: ["situation-client-factures", clientDetails.id],
    });
    return resultat;
  };

  // Le reçu est toujours généré à partir du paiement (type autonome @/types/paiement).
  const handleViewReceipt = (payment: ClientPayment) => {
    const paiementForReceipt: Paiement = {
      id: payment.id,
      facture: payment.facture_id || "",
      client: clientDetails.nom || "",
      client_id: clientDetails.id || "",
      date: payment.date,
      montant: payment.montant,
      mode: payment.mode as Paiement["mode"],
      reference: payment.reference,
      solde_restant: 0,
      est_credit: payment.est_credit,
    };

    setSelectedPaiement(paiementForReceipt);
    setIsPaymentReceiptDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsAddPaiementDialogOpen(true)}
          className="bg-[#3C6255] hover:bg-[#2B4B3E] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un paiement
        </Button>
      </div>

      <PaymentsTable
        payments={clientDetails.paiements}
        onViewReceipt={handleViewReceipt}
      />

      {selectedPaiement && (
        <PaymentReceiptDialog
          open={isPaymentReceiptDialogOpen}
          onOpenChange={setIsPaymentReceiptDialogOpen}
          paiement={selectedPaiement}
        />
      )}

      <PaiementDialog
        open={isAddPaiementDialogOpen}
        onOpenChange={setIsAddPaiementDialogOpen}
        onSubmit={handleAddPaiement}
      />
    </div>
  );
};

export default PaymentsTab;
