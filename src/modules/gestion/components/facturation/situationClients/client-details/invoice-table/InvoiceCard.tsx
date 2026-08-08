
import { ClientInvoice } from "@gestion/types/clientFinancial";
import { formatDate, formatMontant } from "@gestion/utils/formatUtils";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import InvoiceRowActions from "./InvoiceRowActions";

interface InvoiceCardProps {
  invoice: ClientInvoice;
  availableCredits: boolean;
  clientName: string;
  onPreviewClick: (invoice: ClientInvoice) => void;
  onDownloadClick: (invoice: ClientInvoice) => void;
  onOpenApplyCreditDialog: (invoiceId: string) => void;
  onOpenReminderDialog: (invoiceId: string) => void;
}

/**
 * Rendu mobile d'une facture client. Le tableau compte huit colonnes dont
 * trois montants alignés à droite : en 375 px, les chiffres se replient et la
 * comparaison payé / restant devient impossible à lire.
 */
const InvoiceCard = ({
  invoice,
  availableCredits,
  clientName,
  onPreviewClick,
  onDownloadClick,
  onOpenApplyCreditDialog,
  onOpenReminderDialog
}: InvoiceCardProps) => {
  const remainingAmount = Math.max(0, invoice.montant - (invoice.montant_paye || 0));
  const showApplyCredit = availableCredits && remainingAmount > 0;
  const showReminder = ["non_payée", "partiellement_payée", "en_retard"].includes(invoice.status_paiement);

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-tight">{invoice.id}</p>
          <p className="text-xs text-neutral-500">
            Émise le {formatDate(invoice.date)} · échéance {formatDate(invoice.echeance)}
          </p>
        </div>
        <div className="shrink-0">
          <InvoiceStatusBadge status={invoice.status_paiement} />
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded bg-neutral-50 py-1.5">
          <dt className="text-neutral-500">Montant</dt>
          <dd className="font-medium">{formatMontant(invoice.montant)}</dd>
        </div>
        <div className="rounded bg-neutral-50 py-1.5">
          <dt className="text-neutral-500">Payé</dt>
          <dd className="font-medium">{formatMontant(invoice.montant_paye || 0)}</dd>
        </div>
        <div className={`rounded py-1.5 ${remainingAmount > 0 ? "bg-amber-50" : "bg-neutral-50"}`}>
          <dt className="text-neutral-500">Restant</dt>
          <dd className={`font-medium ${remainingAmount > 0 ? "text-amber-700" : ""}`}>
            {formatMontant(remainingAmount)}
          </dd>
        </div>
      </dl>

      <div className="mt-2 flex justify-end">
        <InvoiceRowActions
          invoice={invoice}
          clientName={clientName}
          showApplyCredit={showApplyCredit}
          showReminder={showReminder}
          onPreviewClick={onPreviewClick}
          onDownloadClick={onDownloadClick}
          onApplyCreditClick={onOpenApplyCreditDialog}
          onReminderClick={onOpenReminderDialog}
        />
      </div>
    </div>
  );
};

export default InvoiceCard;
