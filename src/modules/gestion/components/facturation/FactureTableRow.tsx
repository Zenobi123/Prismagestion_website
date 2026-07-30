
import React from 'react';
import { formatCurrency, formatDate } from '@gestion/utils/factureUtils';
import { Button } from "@gestion/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@gestion/components/ui/dropdown-menu"
import { Ban, Download, Edit, Eye, MoreHorizontal, Send, Trash } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Facture } from '@gestion/types/facture';
import FacturePrintButton from '@gestion/components/printable/connectors/FacturePrintButton';

interface FactureTableRowProps {
  facture: Facture;
  onView: (facture: Facture) => void;
  onDownload: (facture: Facture) => void;
  onEdit: (facture: Facture) => void;
  onDelete: (id: string) => void;
  onSend?: (facture: Facture) => void;
  onCancel?: (facture: Facture) => void;
}

// Consulter et modifier une facture passe par les dialogues de la page
// Facturation, pas par une route : /factures/:id et /factures/edit/:id
// n'ont jamais existé. Cette ligne pointait vers ces deux URL et proposait
// deux entrées de menu sans gestionnaire, alors que la vue mobile du même
// tableau appelait déjà les bons rappels. Les deux vues sont désormais
// alignées.
export const FactureTableRow: React.FC<FactureTableRowProps> = ({
  facture,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onSend,
  onCancel,
}) => {
  const { id, client, date, echeance, montant, status_paiement } = facture;
  const clientName = client?.nom || 'N/A';

  return (
    <tr>
      <td>
        <button
          type="button"
          onClick={() => onView(facture)}
          className="font-medium hover:underline text-left"
        >
          {/* Le numéro lisible plutôt que l'identifiant technique, comme
              le fait déjà la vue mobile. */}
          {facture.numero || id}
        </button>
      </td>
      <td>{clientName}</td>
      <td>{formatDate(date)}</td>
      <td>{formatDate(echeance)}</td>
      <td>{formatCurrency(montant)}</td>
      <td><StatusBadge status={facture.status} type="document"/></td>
      <td><StatusBadge status={status_paiement} type="paiement"/></td>
      <td className="text-right">
        <FacturePrintButton facture={facture} variant="icon" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(facture)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(facture)}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </DropdownMenuItem>
            {onSend && (
              <DropdownMenuItem onClick={() => onSend(facture)}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(facture)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            {onCancel && (
              <DropdownMenuItem onClick={() => onCancel(facture)}>
                <Ban className="mr-2 h-4 w-4" />
                Annuler
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-600 focus:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default FactureTableRow;
