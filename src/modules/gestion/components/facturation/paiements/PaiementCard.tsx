import { Paiement } from "@gestion/types/paiement";
import ModePaiementBadge from "./ModePaiementBadge";
import PaiementActionsMenu from "./PaiementActionsMenu";
import { formatMontant } from "@gestion/utils/formatUtils";
import { formatDatePaiement } from "./formatDatePaiement";

interface PaiementCardProps {
  paiement: Paiement;
  onDelete?: (id: string) => Promise<boolean>;
  onViewReceipt: (paiement: Paiement) => void;
}

const nomClient = (client: Paiement["client"]): string =>
  typeof client === "string" ? client : client?.nom || client?.raisonsociale || "";

/**
 * Rendu mobile d'un paiement. Le tableau compte huit colonnes : en 375 px il
 * ne laissait que quelques caractères par cellule. La carte hiérarchise —
 * montant et client en tête, le reste en second plan.
 */
const PaiementCard = ({ paiement, onDelete, onViewReceipt }: PaiementCardProps) => {
  const soldeRestant = Number(paiement.solde_restant) || 0;

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{formatMontant(paiement.montant)}</p>
          <p className="truncate text-sm text-neutral-600">{nomClient(paiement.client)}</p>
        </div>
        <div className="shrink-0">
          <PaiementActionsMenu
            paiement={paiement}
            onDelete={onDelete}
            onViewReceipt={onViewReceipt}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span className="font-medium text-neutral-700">{paiement.reference}</span>
        <span>{formatDatePaiement(paiement.date)}</span>
        <ModePaiementBadge mode={paiement.mode} />
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500">Facture</dt>
          <dd className="truncate font-medium">
            {paiement.facture || (paiement.est_credit ? "Crédit" : "N/A")}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-500">Solde restant</dt>
          <dd className={`font-medium ${soldeRestant > 0 ? "text-amber-700" : ""}`}>
            {formatMontant(paiement.solde_restant)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default PaiementCard;
