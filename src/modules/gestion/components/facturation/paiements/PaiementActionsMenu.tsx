import { useState } from "react";
import { Button } from "@gestion/components/ui/button";
import { Eye, FileText, Trash, CreditCard, MoreHorizontal } from "lucide-react";
import { Paiement } from "@gestion/types/paiement";
import { formatMontant } from "@gestion/utils/formatUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@gestion/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@gestion/components/ui/dropdown-menu";
import { formatDatePaiement } from "./formatDatePaiement";

interface PaiementActionsMenuProps {
  paiement: Paiement;
  onDelete?: (id: string) => Promise<boolean>;
  onViewReceipt: (paiement: Paiement) => void;
}

/**
 * Menu d'actions d'un paiement, **partagé** par la ligne de tableau et par la
 * carte mobile : les deux rendus ne peuvent pas proposer des actions
 * différentes.
 */
const PaiementActionsMenu = ({ paiement, onDelete, onViewReceipt }: PaiementActionsMenuProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(paiement.id);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleViewDetails = () => {
    // This would typically open a modal or navigate to a details page
    alert(`Détails du paiement ${paiement.reference}
    - Montant: ${formatMontant(paiement.montant)}
    - Mode: ${paiement.mode}
    - Date: ${formatDatePaiement(paiement.date)}
    - Client: ${paiement.client}
    - Référence: ${paiement.reference}
    ${paiement.notes ? `- Notes: ${paiement.notes}` : ''}
    `);
  };

  const handleViewReceipt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onViewReceipt(paiement);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions du paiement ${paiement.reference}`}
            className="cible-tactile h-11 w-11 justify-center"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56 bg-white">
          <DropdownMenuItem
            onClick={handleViewReceipt}
            className="cursor-pointer flex items-center hover:bg-gray-100"
          >
            <FileText className="h-4 w-4 mr-2" />
            Voir le reçu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleViewDetails}
            className="cursor-pointer flex items-center hover:bg-gray-100"
          >
            <Eye className="h-4 w-4 mr-2" />
            Détails
          </DropdownMenuItem>
          {paiement.est_credit && (
            <DropdownMenuItem className="cursor-pointer flex items-center hover:bg-gray-100">
              <CreditCard className="h-4 w-4 mr-2" />
              Associer à une facture
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              className="text-red-500 cursor-pointer flex items-center hover:bg-gray-100"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera définitivement le paiement {paiement.reference}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaiementActionsMenu;
