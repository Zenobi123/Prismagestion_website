// Aperçu / téléchargement de REÇU — route vers le rendu fidèle unifié
// (DocumentPreviewProvider) au lieu du PDF jsPDF programmatique.
import { Paiement } from '@gestion/types/paiement';
import { useDocumentPreview } from '@gestion/components/printable/DocumentPreviewProvider';

export const useReceiptPreview = () => {
  const { previewRecu, downloadRecu } = useDocumentPreview();

  const handleVoirRecu = (paiement: Paiement) => previewRecu(paiement);
  const handleTelechargerRecu = (paiement: Paiement) => downloadRecu(paiement);

  return {
    handleVoirRecu,
    handleTelechargerRecu,
  };
};
