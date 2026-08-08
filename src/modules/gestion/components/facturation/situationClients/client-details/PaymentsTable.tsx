
import { formatMontant } from "@gestion/utils/formatUtils";
import { ClientPayment } from "@gestion/types/clientFinancial";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@gestion/components/ui/table";
import { Badge } from "@gestion/components/ui/badge";
import ModePaiementBadge from "../../paiements/ModePaiementBadge";
import { Button } from "@gestion/components/ui/button";
import { FileText } from "lucide-react";
import { formatDatePaiement } from "../../paiements/formatDatePaiement";

interface PaymentsTableProps {
  payments: ClientPayment[];
  onViewReceipt?: (payment: ClientPayment) => void;
}

const PaymentsTable = ({ payments, onViewReceipt }: PaymentsTableProps) => {
  const typeBadge = (estCredit?: boolean) =>
    estCredit ? (
      <Badge className="bg-blue-500">Avance</Badge>
    ) : (
      <Badge variant="outline">Standard</Badge>
    );

  if (!payments || payments.length === 0) {
    return (
      <div className="rounded-lg border py-6 text-center text-gray-500">
        Aucun paiement trouvé pour ce client
      </div>
    );
  }

  return (
    <>
      {/* Mobile : cartes. Sept colonnes ne tiennent pas en 375 px. */}
      <div className="space-y-2 sm:hidden">
        {payments.map((paiement) => (
          <div key={paiement.id} className="rounded-lg border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{formatMontant(paiement.montant)}</p>
                <p className="truncate text-xs text-neutral-500">{paiement.reference}</p>
              </div>
              {onViewReceipt && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Voir le reçu ${paiement.reference}`}
                  className="cible-tactile h-11 w-11 shrink-0 justify-center p-0"
                  onClick={() => onViewReceipt(paiement)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
              <span>{formatDatePaiement(paiement.date)}</span>
              <ModePaiementBadge mode={paiement.mode} />
              {typeBadge(paiement.est_credit)}
            </div>

            <p className="mt-1 truncate text-xs text-neutral-500">
              Facture : {paiement.facture_id || (paiement.est_credit ? "Crédit" : "N/A")}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Facture</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((paiement) => (
              <TableRow key={paiement.id}>
                <TableCell className="font-medium">{paiement.reference}</TableCell>
                <TableCell>{formatDatePaiement(paiement.date)}</TableCell>
                <TableCell>{formatMontant(paiement.montant)}</TableCell>
                <TableCell>
                  <ModePaiementBadge mode={paiement.mode} />
                </TableCell>
                <TableCell>
                  {paiement.facture_id || (paiement.est_credit ? "Crédit" : "N/A")}
                </TableCell>
                <TableCell>{typeBadge(paiement.est_credit)}</TableCell>
                <TableCell className="text-right">
                  {onViewReceipt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Voir le reçu ${paiement.reference}`}
                      className="cible-tactile h-11 w-11 justify-center p-0"
                      onClick={() => onViewReceipt(paiement)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default PaymentsTable;
