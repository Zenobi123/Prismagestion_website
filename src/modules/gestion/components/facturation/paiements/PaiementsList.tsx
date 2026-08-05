
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@gestion/components/ui/table";
import PaiementTableRow from "./PaiementTableRow";
import { Card, CardContent } from "@gestion/components/ui/card";
import { Paiement } from "@gestion/types/paiement";
import { useReceiptPreview } from "@gestion/hooks/facturation/factureActions/hooks/useReceiptPreview";

interface PaiementsListProps {
  paiements: Paiement[];
  onDelete?: (id: string) => Promise<boolean>;
}

const PaiementsList = ({ paiements, onDelete }: PaiementsListProps) => {
  // Reçu identique au modèle de référence (recu-app.html) : rendu unique
  // servi par le DocumentPreviewProvider, ventilation Impôts / Honoraires
  // comprise.
  const { handleVoirRecu } = useReceiptPreview();

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Solde restant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiements.length === 0 ? (
                  <TableRow>
                    <TableHead colSpan={8} className="text-center py-6">
                      Aucun paiement trouvé
                    </TableHead>
                  </TableRow>
                ) : (
                  paiements.map((paiement) => (
                    <PaiementTableRow 
                      key={paiement.id}
                      paiement={paiement}
                      onDelete={onDelete}
                      onViewReceipt={handleVoirRecu}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PaiementsList;
