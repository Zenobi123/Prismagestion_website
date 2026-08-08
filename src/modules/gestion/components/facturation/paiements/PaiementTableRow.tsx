
import { TableCell, TableRow } from "@gestion/components/ui/table";
import { Paiement } from "@gestion/types/paiement";
import ModePaiementBadge from "./ModePaiementBadge";
import PaiementActionsMenu from "./PaiementActionsMenu";
import { formatMontant } from "@gestion/utils/formatUtils";
import { formatDatePaiement } from "./formatDatePaiement";

interface PaiementTableRowProps {
  paiement: Paiement;
  onDelete?: (id: string) => Promise<boolean>;
  onViewReceipt: (paiement: Paiement) => void;
}

const PaiementTableRow = ({ paiement, onDelete, onViewReceipt }: PaiementTableRowProps) => {
  return (
    <TableRow key={paiement.id}>
      <TableCell className="font-medium">{paiement.reference}</TableCell>
      <TableCell>{paiement.facture || (paiement.est_credit ? "Crédit" : "N/A")}</TableCell>
      <TableCell>
        {typeof paiement.client === "string"
          ? paiement.client
          : (paiement.client?.nom || paiement.client?.raisonsociale || "")}
      </TableCell>
      <TableCell>{formatDatePaiement(paiement.date)}</TableCell>
      <TableCell>{formatMontant(paiement.montant)}</TableCell>
      <TableCell>
        <ModePaiementBadge mode={paiement.mode} />
      </TableCell>
      <TableCell>{formatMontant(paiement.solde_restant)}</TableCell>
      <TableCell className="text-right">
        <PaiementActionsMenu
          paiement={paiement}
          onDelete={onDelete}
          onViewReceipt={onViewReceipt}
        />
      </TableCell>
    </TableRow>
  );
};

export default PaiementTableRow;
