
import { Paiement } from "@gestion/types/paiement";

interface ReceiptFooterProps {
  paiement: Paiement;
}

const ReceiptFooter = ({ paiement }: ReceiptFooterProps) => {
  return (
    <>
      {paiement.notes && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-1">Notes</h3>
          <p className="text-gray-600 bg-gray-50 p-2 rounded">{paiement.notes}</p>
        </div>
      )}
      
      <div className="text-center text-sm text-gray-500 mt-6">
        Ce reçu confirme le traitement de votre paiement.
      </div>
    </>
  );
};

export default ReceiptFooter;
