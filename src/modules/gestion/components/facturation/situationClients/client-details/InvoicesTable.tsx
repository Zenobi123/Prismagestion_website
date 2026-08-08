
import { ClientInvoice } from "@gestion/types/clientFinancial";
import { ClientPayment } from "@gestion/types/clientFinancial";
import { Facture } from "@gestion/types/facture";
import { Table, TableBody } from "@gestion/components/ui/table";
import useFactureViewActions from "@gestion/hooks/facturation/factureActions/useFactureViewActions";
import InvoiceTableHeader from "./invoice-table/InvoiceTableHeader";
import InvoiceTableRow from "./invoice-table/InvoiceTableRow";
import InvoiceTableEmpty from "./invoice-table/InvoiceTableEmpty";
import InvoiceCard from "./invoice-table/InvoiceCard";

interface InvoicesTableProps {
  invoices: ClientInvoice[];
  availableCredits: ClientPayment[];
  onOpenApplyCreditDialog: (invoiceId: string) => void;
  onOpenReminderDialog: (invoiceId: string) => void;
  clientName: string;
}

const InvoicesTable = ({ 
  invoices, 
  availableCredits, 
  onOpenApplyCreditDialog,
  onOpenReminderDialog,
  clientName
}: InvoicesTableProps) => {
  const { handleVoirFacture, handleTelechargerFacture } = useFactureViewActions();

  const convertToFacture = (invoice: ClientInvoice): Facture => {
    return {
      id: invoice.id,
      client_id: invoice.id.split('-')[0], // Estimation de l'ID client
      client: {
        id: invoice.id.split('-')[0], // Estimation de l'ID client
        nom: clientName,
        adresse: "",
        telephone: "",
        email: ""
      },
      date: invoice.date,
      echeance: invoice.echeance,
      montant: invoice.montant,
      montant_paye: invoice.montant_paye,
      status: invoice.status as "brouillon" | "envoyée" | "annulée",
      status_paiement: invoice.status_paiement as "non_payée" | "partiellement_payée" | "payée" | "en_retard",
      prestations: []
    };
  };

  // Aperçu : document identique au modèle de référence (facture-app.html),
  // servi par le rendu unique du DocumentPreviewProvider.
  const handlePreviewClick = (invoice: ClientInvoice) => {
    handleVoirFacture(convertToFacture(invoice));
  };

  const handleDownloadClick = (invoice: ClientInvoice) => {
    handleTelechargerFacture(convertToFacture(invoice));
  };

  const hasCreditAvailable = availableCredits.length > 0;

  return (
    <>
      {/* Mobile : cartes. Huit colonnes dont trois montants ne tiennent pas
          en 375 px, et la comparaison payé / restant devient illisible. */}
      <div className="space-y-2 sm:hidden">
        {invoices.length === 0 ? (
          <div className="rounded-lg border py-6 text-center text-gray-500">
            Aucune facture trouvée pour ce client
          </div>
        ) : (
          invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              availableCredits={hasCreditAvailable}
              clientName={clientName}
              onPreviewClick={handlePreviewClick}
              onDownloadClick={handleDownloadClick}
              onOpenApplyCreditDialog={onOpenApplyCreditDialog}
              onOpenReminderDialog={onOpenReminderDialog}
            />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto sm:block">
      <Table>
        <InvoiceTableHeader />
        <TableBody>
          {invoices.length === 0 ? (
            <InvoiceTableEmpty />
          ) : (
            invoices.map((invoice) => (
              <InvoiceTableRow
                key={invoice.id}
                invoice={invoice}
                availableCredits={hasCreditAvailable}
                clientName={clientName}
                onPreviewClick={handlePreviewClick}
                onDownloadClick={handleDownloadClick}
                onOpenApplyCreditDialog={onOpenApplyCreditDialog}
                onOpenReminderDialog={onOpenReminderDialog}
              />
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </>
  );
};

export default InvoicesTable;
